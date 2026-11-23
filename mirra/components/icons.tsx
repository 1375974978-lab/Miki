import type { SVGProps } from "react";

type IconName =
  | "alert"
  | "arrow-left"
  | "arrow-right"
  | "bookmark"
  | "check"
  | "chevron-down"
  | "clock"
  | "close"
  | "external"
  | "link"
  | "spark"
  | "trash"
  | "trend";

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 18, ...props }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };

  switch (name) {
    case "alert":
      return (
        <svg {...common}>
          <path d="M12 3.5 21 20H3L12 3.5Z" />
          <path d="M12 9v5M12 17.5v.1" />
        </svg>
      );
    case "arrow-left":
      return (
        <svg {...common}>
          <path d="m15 18-6-6 6-6" />
        </svg>
      );
    case "arrow-right":
      return (
        <svg {...common}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      );
    case "bookmark":
      return (
        <svg {...common}>
          <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4Z" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );
    case "chevron-down":
      return (
        <svg {...common}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 2" />
        </svg>
      );
    case "close":
      return (
        <svg {...common}>
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      );
    case "external":
      return (
        <svg {...common}>
          <path d="M14 5h5v5M10 14 19 5M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
        </svg>
      );
    case "link":
      return (
        <svg {...common}>
          <path d="M10.5 13.5 13.5 10.5" />
          <path d="M7.2 16.8 5.9 18a3.5 3.5 0 0 1-5-5l3-3a3.5 3.5 0 0 1 5 0" transform="translate(2 0)" />
          <path d="m16.8 7.2 1.3-1.3a3.5 3.5 0 0 0-5-5l-3 3a3.5 3.5 0 0 0 0 5" transform="translate(2 0)" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="M12 3.5c.5 4.4 2.1 6 6.5 6.5-4.4.5-6 2.1-6.5 6.5-.5-4.4-2.1-6-6.5-6.5 4.4-.5 6-2.1 6.5-6.5Z" />
          <path d="M18.5 15.5c.2 1.7.8 2.3 2.5 2.5-1.7.2-2.3.8-2.5 2.5-.2-1.7-.8-2.3-2.5-2.5 1.7-.2 2.3-.8 2.5-2.5Z" />
        </svg>
      );
    case "trash":
      return (
        <svg {...common}>
          <path d="M4.5 7h15M9 7V4.5h6V7M7 7l1 13h8l1-13M10 11v5M14 11v5" />
        </svg>
      );
    case "trend":
      return (
        <svg {...common}>
          <path d="M4 17 9.5 11.5 13 15l7-9" />
          <path d="M16 6h4v4" />
        </svg>
      );
    default:
      return null;
  }
}
