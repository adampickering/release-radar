import { UntitledLogo } from "@/components/foundations/logo/untitledui-logo";
import { AngelList, Dribbble, Facebook, GitHub, Layers, LinkedIn, X } from "@/components/foundations/social-icons";

const footerSocials = [
    {
        label: "X",
        icon: X,
        href: "https://x.com/",
    },
    {
        label: "LinkedIn",
        icon: LinkedIn,
        href: "https://www.linkedin.com/",
    },
    {
        label: "Facebook",
        icon: Facebook,
        href: "https://www.facebook.com/",
    },
    {
        label: "GitHub",
        icon: GitHub,
        href: "https://github.com/",
    },
    {
        label: "AngelList",
        icon: AngelList,
        href: "https://angel.co/",
    },
    {
        label: "Dribbble",
        icon: Dribbble,
        href: "https://dribbble.com/",
    },
    {
        label: "Layers",
        icon: Layers,
        href: "https://layers.com/",
    },
];

export const FooterSmall03Brand = () => {
    return (
        <footer className="bg-brand-section py-12">
            <div className="mx-auto max-w-container px-4 md:px-8">
                <div className="flex flex-col items-center justify-between lg:flex-row">
                    <ul className="mt-12 flex gap-4 lg:mt-0 lg:w-full lg:max-w-xs">
                        {footerSocials.map(({ label, icon: Icon, href }) => (
                            <li key={label}>
                                <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex rounded-xs text-icon-fg-brand_on-brand outline-focus-ring transition duration-100 ease-linear hover:text-fg-quaternary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
                                >
                                    <Icon className="size-5" aria-label={label} />
                                </a>
                            </li>
                        ))}
                    </ul>

                    <UntitledLogo className="dark-mode order-first h-7 w-min shrink-0 lg:order-none" />

                    <p className="mt-6 text-sm text-quaternary_on-brand lg:mt-0 lg:w-full lg:max-w-xs lg:text-right">
                        © 2077 Untitled UI. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};
