import type { ReactNode } from "react";
import { IconApp } from "./icons";

type AppWindowProps = {
  title: string;
  icon?: ReactNode;
  menu?: ReactNode;
  toolbar?: ReactNode;
  statusBar?: ReactNode;
  children: ReactNode;
  className?: string;
  variant?: "maximized" | "dialog";
};

export function AppWindow({
  title,
  icon,
  menu,
  toolbar,
  statusBar,
  children,
  className = "",
  variant = "maximized",
}: AppWindowProps) {
  const shellClass =
    variant === "maximized" ? "xp-window xp-window--maximized" : "xp-window xp-window--dialog";

  return (
    <div className={`xp-desktop ${className}`}>
      <div className={shellClass}>
        <TitleBar title={title} icon={icon} />
        {menu ? <div className="xp-menubar">{menu}</div> : null}
        {toolbar ? <div className="xp-toolbar">{toolbar}</div> : null}
        <div className="xp-client">{children}</div>
        {statusBar ? <div className="xp-statusbar">{statusBar}</div> : null}
      </div>
    </div>
  );
}

type TitleBarProps = {
  title: string;
  icon?: ReactNode;
};

export function TitleBar({ title, icon }: TitleBarProps) {
  return (
    <div className="xp-titlebar">
      <div className="xp-titlebar__left">
        <span className="xp-titlebar__icon">{icon ?? <IconApp size={16} />}</span>
        <span className="xp-titlebar__text">{title}</span>
      </div>
      <div className="xp-titlebar__buttons" aria-hidden>
        <span className="xp-titlebar__btn xp-titlebar__btn--min" />
        <span className="xp-titlebar__btn xp-titlebar__btn--max" />
        <span className="xp-titlebar__btn xp-titlebar__btn--close" />
      </div>
    </div>
  );
}

type GroupBoxProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

export function GroupBox({ label, children, className = "" }: GroupBoxProps) {
  return (
    <fieldset className={`xp-groupbox ${className}`}>
      <legend className="xp-groupbox__legend">{label}</legend>
      {children}
    </fieldset>
  );
}

type StatusBarSectionProps = {
  children: ReactNode;
  grow?: boolean;
};

export function StatusBarSection({ children, grow }: StatusBarSectionProps) {
  return (
    <span className={`xp-statusbar__section${grow ? " xp-statusbar__section--grow" : ""}`}>
      {children}
    </span>
  );
}

export function ToolbarSeparator() {
  return <span className="xp-toolbar__sep" aria-hidden />;
}

type XpButtonProps = {
  children: ReactNode;
  type?: "button" | "submit";
  variant?: "default" | "primary";
  pressed?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  title?: string;
};

export function XpButton({
  children,
  type = "button",
  variant = "default",
  pressed = false,
  disabled = false,
  onClick,
  className = "",
  title,
}: XpButtonProps) {
  const classes = [
    "xp-btn",
    variant === "primary" ? "xp-btn--primary" : "",
    pressed ? "xp-btn--pressed" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}

type ToolbarButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  type?: "button" | "submit";
};

export function ToolbarButton({
  children,
  onClick,
  disabled,
  title,
  type = "button",
}: ToolbarButtonProps) {
  return (
    <button
      type={type}
      className="xp-toolbar-btn"
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
}

type XpInputProps = {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  "aria-label"?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
};

export function XpInput({
  id,
  name,
  value,
  defaultValue,
  onChange,
  placeholder,
  type = "text",
  required,
  disabled,
  autoFocus,
  className = "",
  "aria-label": ariaLabel,
  onKeyDown,
  onBlur,
}: XpInputProps) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      defaultValue={defaultValue}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      autoFocus={autoFocus}
      aria-label={ariaLabel}
      className={`xp-input ${className}`}
      onChange={onChange ? (e) => onChange(e.currentTarget.value) : undefined}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
    />
  );
}

type StatusLabelProps = {
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
};

export function StatusLabel({ status }: StatusLabelProps) {
  const map = {
    NOT_STARTED: { text: "Not started", className: "xp-status-label--neutral" },
    IN_PROGRESS: { text: "In progress", className: "xp-status-label--active" },
    COMPLETED: { text: "Completed", className: "xp-status-label--done" },
  };
  const { text, className } = map[status];
  return <span className={`xp-status-label ${className}`}>{text}</span>;
}

type XpAlertProps = {
  variant?: "error" | "warning";
  title?: string;
  children: ReactNode;
};

export function XpAlert({ variant = "error", title, children }: XpAlertProps) {
  return (
    <div className={`xp-alert xp-alert--${variant}`} role="alert">
      {title ? <strong className="xp-alert__title">{title}</strong> : null}
      <span>{children}</span>
    </div>
  );
}
