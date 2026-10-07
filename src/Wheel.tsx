import type { Activity } from "./types";
import { Icon } from "./Icons";

const colors = [
  "#ecd3ab",
  "#bfcfbe",
  "#e8b8a5",
  "#e7debf",
  "#c5d3d0",
  "#e3c2ad",
  "#d4d7b7",
  "#edceba",
];
const point = (angle: number, radius: number) => {
  const radians = ((angle - 90) * Math.PI) / 180;
  return [240 + radius * Math.cos(radians), 240 + radius * Math.sin(radians)];
};

function lines(title: string) {
  const result: string[] = [""];
  for (const word of title.split(" ")) {
    const index = result.length - 1;
    if ((result[index] + " " + word).trim().length > 17 && result[index])
      result.push(word);
    else result[index] = (result[index] + " " + word).trim();
  }
  return result;
}

export default function Wheel({
  sectors,
  rotation,
  spinning,
  reducedMotion,
}: {
  sectors: Activity[];
  rotation: number;
  spinning: boolean;
  reducedMotion: boolean;
}) {
  const count = sectors.length;
  const step = count ? 360 / count : 360;
  return (
    <div
      className={`wheel-wrap ${spinning ? "is-spinning" : ""}`}
      aria-hidden="true"
    >
      <div className="wheel-pointer" />
      <div className="wheel-rim">
        <svg
          className="wheel"
          viewBox="0 0 480 480"
          data-testid="wheel"
          data-rotation={rotation}
          data-count={count}
          style={{
            transform: `rotate(${rotation}deg)`,
            transition:
              spinning && count > 1
                ? `transform ${reducedMotion ? 0.12 : 3.6}s cubic-bezier(.14,.68,.13,1)`
                : "none",
          }}
        >
          {count === 0 && <circle cx="240" cy="240" r="235" fill="#e9e4d8" />}
          {sectors.map((activity, index) => {
            const start = point(index * step - step / 2, 235);
            const end = point(index * step + step / 2, 235);
            return (
              <g key={activity.id} data-activity-id={activity.id}>
                {count === 1 ? (
                  <circle cx="240" cy="240" r="235" fill={colors[0]} />
                ) : (
                  <path
                    d={`M240,240 L${start.join(",")} A235,235 0 ${step > 180 ? 1 : 0},1 ${end.join(",")} Z`}
                    fill={colors[index % colors.length]}
                    stroke="#f9f6ee"
                    strokeWidth="2"
                  />
                )}
                <g transform={`rotate(${index * step} 240 240)`}>
                  <circle cx="240" cy="31" r="3" fill="#66584a" opacity=".5" />
                  <text
                    x="240"
                    y="62"
                    textAnchor="middle"
                    fill="#363b33"
                    fontSize="13"
                    fontWeight="600"
                  >
                    {lines(activity.title).map((line, lineIndex) => (
                      <tspan
                        key={lineIndex}
                        x="240"
                        dy={lineIndex === 0 ? 0 : 17}
                      >
                        {line}
                      </tspan>
                    ))}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
        <div className="wheel-center">
          <Icon name="spark" size={23} />
          <span>
            et si
            <br />
            <i>on essayait ?</i>
          </span>
        </div>
      </div>
      <span className="wheel-scribble">un petit pas de côté</span>
      <svg className="scribble-arrow" viewBox="0 0 70 55">
        <path
          d="M3 8c45-12 59 2 44 32m-8-9 7 12 13-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
