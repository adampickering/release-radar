import type { ButtonProps as EmailButtonProps } from "@react-email/components";
import { Button as EmailButton } from "@react-email/components";
import { cx } from "../../../utils/cx";

const variants = {
    primary: "bg-brand-solid border text-white  border-violet-700",
    secondary: "bg-primary text-secondary border border-primary",
};

const sizes = {
    sm: "px-3 py-[5px] text-sm font-semibold",
    md: "px-3.5 py-[7px] text-md font-semibold",
    lg: "px-4.5 py-[9px] text-md font-semibold",
};

interface ButtonProps extends EmailButtonProps {
    color?: keyof typeof variants;
    size?: keyof typeof sizes;
}

export const Button = ({ color = "primary", size = "md", ...props }: ButtonProps) => {
    return (
        <EmailButton {...props} className={cx("rounded-lg", variants[color], sizes[size], props.className)}>
            {props.children}
        </EmailButton>
    );
};
