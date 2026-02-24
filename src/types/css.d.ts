import "react";

declare module "react" {
    interface CSSProperties {
        scrollbarWidth?: "auto" | "thin" | "none";
        msOverflowStyle?: "auto" | "none" | "scrollbar" | "-ms-autohiding-scrollbar";
    }
}
