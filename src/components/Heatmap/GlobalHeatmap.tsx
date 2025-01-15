import { useMemo, useState } from "react";
import { useProjectStore } from "../../stores/projectStore";
import { getDatesInRange, getColorIntensity } from "../../utils/date";
import { formatMinutes } from "../../utils/format";

export const GlobalHeatmap = () => {
  const projects = useProjectStore((state) => state.projects);
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  const { dailyMinutes, weeks, months } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setFullYear(end.getFullYear() - 1);
    start.setDate(start.getDate() - start.getDay());

    const dates = getDatesInRange(start, end);
    const dailyMinutes: Record<string, number> = {};
    const weeks: string[][] = Array(53)
      .fill(0)
      .map(() => []);
    const months: { name: string; index: number }[] = [];

    // 초기화
    dates.forEach((date) => {
      dailyMinutes[date] = 0;
    });

    // 각 프로젝트의 작업 시간을 합산
    projects.forEach((project) => {
      project.timeLogs?.forEach((log) => {
        if (dailyMinutes.hasOwnProperty(log.date)) {
          dailyMinutes[log.date] += log.minutes; // minutes 그대로 사용
        }
      });
    });

    // 주별로 데이터 정리 (과거 -> 최근 순서로)
    let currentMonth = -1;
    let weekIndex = 0;

    dates.forEach((date) => {
      const dayObj = new Date(date);
      const month = dayObj.getMonth();
      const dayOfWeek = dayObj.getDay();

      // 월이 바뀌면 기록
      if (month !== currentMonth) {
        currentMonth = month;
        months.push({
          name: dayObj.toLocaleDateString("ko-KR", { month: "short" }),
          index: weekIndex,
        });
      }

      // 일요일이고 이미 데이터가 있으면 다음 주로
      if (dayOfWeek === 0 && weeks[weekIndex].length > 0) {
        weekIndex++;
      }

      weeks[weekIndex].push(date);
    });

    return {
      dailyMinutes,
      weeks: weeks.filter((week) => week.length > 0),
      months: months.filter((month, i, arr) => {
        return i === 0 || month.name !== arr[i - 1].name;
      }),
    };
  }, [projects]);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative ml-6 flex h-4">
        {months.map((month, i) => (
          <div
            key={i}
            className="absolute text-xs text-neutral-400"
            style={{
              left: `${month.index * 16}px`,
              top: 0,
            }}
          >
            {month.name}
          </div>
        ))}
      </div>
      <div className="flex flex-col">
        <div className="flex">
          <div className="flex flex-col justify-between pr-2 text-xs text-neutral-400 h-[94px]">
            <span className="opacity-0">.</span>
            <span>월</span>
            <span className="opacity-0">.</span>
            <span>수</span>
            <span className="opacity-0">.</span>
            <span>금</span>
            <span className="opacity-0">.</span>
          </div>
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {Array(7)
                  .fill(0)
                  .map((_, dayIndex) => {
                    const date = week[dayIndex];
                    const minutes = date ? dailyMinutes[date] : 0;
                    const formattedDate = date
                      ? new Date(date).toLocaleDateString("ko-KR", {
                          month: "long",
                          day: "numeric",
                        })
                      : "";

                    return (
                      <div
                        key={dayIndex}
                        className={`w-3 h-3 rounded-sm ${
                          date ? getColorIntensity(minutes) : "bg-neutral-800"
                        }`}
                        onMouseMove={(e) => {
                          if (date) {
                            setTooltip({
                              text: `${formattedDate} ${formatMinutes(
                                minutes
                              )} 작업`,
                              x: e.clientX,
                              y: e.clientY,
                            });
                          }
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between items-center text-xs text-neutral-400 mt-2 ml-4 mr-4">
          <span>
            최근 1년 동안:{" "}
            {formatMinutes(
              Object.values(dailyMinutes).reduce(
                (sum, minutes) => sum + minutes,
                0
              )
            )}
          </span>
          <div className="flex items-center gap-2">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-neutral-700" />
              <div className="w-3 h-3 rounded-sm bg-emerald-900" />
              <div className="w-3 h-3 rounded-sm bg-emerald-700" />
              <div className="w-3 h-3 rounded-sm bg-emerald-500" />
              <div className="w-3 h-3 rounded-sm bg-emerald-300" />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
      {tooltip && (
        <div
          className="fixed z-50 bg-neutral-900 text-white px-2 py-1 rounded text-xs pointer-events-none animate-fadeIn"
          style={{
            left: tooltip.x - 50,
            top: tooltip.y - 25,
            transform: "translateX(-50%)",
            width: "max-content",
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};
