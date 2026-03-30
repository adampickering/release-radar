import React from "react"
import { Column, Container, Hr, Html, Img, Preview, Row } from "@react-email/components"
import { Body } from "../components/emails/_components/body"
import { Button } from "../components/emails/_components/button"
import { LeftAligned as Footer } from "../components/emails/_components/footer"
import { Head } from "../components/emails/_components/head"
import { Tailwind } from "../components/emails/_components/tailwind"
import { Text } from "../components/emails/_components/text"

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
    feature: { bg: "#ECFDF3", text: "#067647" },
    improvement: { bg: "#F4F3FF", text: "#5925DC" },
    fix: { bg: "#FFF6ED", text: "#B93815" },
    launch: { bg: "#EFF8FF", text: "#175CD3" },
    milestone: { bg: "#F2F4F7", text: "#344054" },
}

interface WeeklyDigestProps {
    firstName?: string
    weekRange?: string
    greeting?: string
    introParagraph?: string
    stats?: { releases: number; brands: number; features: number; fixes: number }
    highlights?: Array<{ title: string; type: string; summary: string }>
    otherReleases?: Array<{ title: string; type: string; shortSummary: string }>
    closingJoke?: string
    unsubscribeUrl?: string
    dashboardUrl?: string
    theme?: "light" | "dark"
}

export const WeeklyDigest = ({
    firstName = "there",
    weekRange = "March 24 – 30, 2026",
    greeting = "Hey",
    introParagraph = "Here's what shipped this week.",
    stats = { releases: 24, brands: 12, features: 9, fixes: 5 },
    highlights = [
        {
            title: "GitHub Copilot Agent Mode",
            type: "feature",
            summary: "Copilot can now autonomously plan, write, and iterate on multi-file changes without step-by-step prompting.",
        },
        {
            title: "Vercel v0 reaches GA",
            type: "launch",
            summary: "Vercel's AI-powered UI generation tool is now generally available with team collaboration and versioning.",
        },
        {
            title: "Tailwind CSS v4.2",
            type: "improvement",
            summary: "Ships with a new plugin API, improved dark-mode utilities, and a faster incremental build engine.",
        },
    ],
    otherReleases = [
        { title: "React 19.1", type: "fix", shortSummary: "Patches hydration edge cases with concurrent transitions." },
        { title: "Prisma 6.5", type: "improvement", shortSummary: "Adds typed SQL raw queries and improved Zod integration." },
        { title: "Bun 1.2.8", type: "fix", shortSummary: "Fixes Windows symlink resolution and improves hot-reload speed." },
    ],
    closingJoke = "Why do developers prefer dark mode? Because light attracts bugs. 🐛",
    unsubscribeUrl = "https://example.com/unsubscribe",
    dashboardUrl = "https://example.com/dashboard",
    theme,
}: WeeklyDigestProps) => {
    return (
        <Html>
            <Tailwind theme={theme}>
                <Head />
                <Preview>The Weekly Roundup — {weekRange}</Preview>
                <Body>
                    <Container align="center" className="w-full max-w-160 bg-primary md:p-8">
                        {/* Header */}
                        <Container align="center" className="max-w-full bg-primary p-6">
                            <Row>
                                <Column align="center">
                                    <Img src="https://releaseradar.work/am-logo.png" alt="Awesome Motive" width="36" height="36" style={{ borderRadius: '50%', background: '#0a0d12' }} />
                                </Column>
                            </Row>
                        </Container>

                        <Container align="left" className="max-w-full px-6 py-8">
                            {/* Greeting */}
                            <Text className="text-xl font-semibold text-primary">
                                {greeting} {firstName} 👋
                            </Text>
                            <Text className="mt-2 text-sm text-tertiary md:text-md">
                                {introParagraph}
                            </Text>

                            {/* Stats Row */}
                            <Container className="my-6 max-w-full rounded-xl bg-secondary px-4 py-5">
                                <Row>
                                    <Column className="border-r border-secondary text-center">
                                        <Text className="text-2xl font-bold text-primary">{stats.releases}</Text>
                                        <Text className="mt-1 text-xs text-tertiary">Releases</Text>
                                    </Column>
                                    <Column className="border-r border-secondary text-center">
                                        <Text className="text-2xl font-bold text-primary">{stats.brands}</Text>
                                        <Text className="mt-1 text-xs text-tertiary">Brands</Text>
                                    </Column>
                                    <Column className="border-r border-secondary text-center">
                                        <Text className="text-2xl font-bold text-primary">{stats.features}</Text>
                                        <Text className="mt-1 text-xs text-tertiary">Features</Text>
                                    </Column>
                                    <Column className="text-center">
                                        <Text className="text-2xl font-bold text-primary">{stats.fixes}</Text>
                                        <Text className="mt-1 text-xs text-tertiary">Fixes</Text>
                                    </Column>
                                </Row>
                            </Container>

                            <Hr className="my-6 border-t border-secondary" />

                            {/* Highlights */}
                            <Text className="mb-4 text-md font-semibold text-primary">🔥 Highlights</Text>
                            {highlights.map((item, index) => {
                                const colors = TYPE_COLORS[item.type] ?? TYPE_COLORS.milestone
                                return (
                                    <Container key={index} className="mb-4 max-w-full rounded-xl bg-secondary p-5">
                                        <Row>
                                            <Column>
                                                <Text className="text-md font-semibold text-primary">{item.title}</Text>
                                            </Column>
                                            <Column className="w-auto">
                                                <span
                                                    style={{
                                                        display: "inline-block",
                                                        backgroundColor: colors.bg,
                                                        color: colors.text,
                                                        fontSize: "11px",
                                                        fontWeight: 600,
                                                        padding: "2px 8px",
                                                        borderRadius: "9999px",
                                                        textTransform: "capitalize",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {item.type}
                                                </span>
                                            </Column>
                                        </Row>
                                        <Text className="mt-2 text-sm text-tertiary">{item.summary}</Text>
                                    </Container>
                                )
                            })}

                            <Hr className="my-6 border-t border-secondary" />

                            {/* Other Releases */}
                            <Text className="mb-4 text-md font-semibold text-primary">📦 Everything Else</Text>
                            {otherReleases.map((item, index) => {
                                const colors = TYPE_COLORS[item.type] ?? TYPE_COLORS.milestone
                                return (
                                    <Row key={index} className="mb-3">
                                        <Column>
                                            <Text className="text-sm font-semibold text-primary">{item.title}</Text>
                                            <Text className="mt-0.5 text-sm text-tertiary">{item.shortSummary}</Text>
                                        </Column>
                                        <Column className="w-auto pl-4">
                                            <span
                                                style={{
                                                    display: "inline-block",
                                                    backgroundColor: colors.bg,
                                                    color: colors.text,
                                                    fontSize: "11px",
                                                    fontWeight: 600,
                                                    padding: "2px 8px",
                                                    borderRadius: "9999px",
                                                    textTransform: "capitalize",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {item.type}
                                            </span>
                                        </Column>
                                    </Row>
                                )
                            })}

                            <Hr className="my-6 border-t border-secondary" />

                            {/* Closing Joke */}
                            <Container className="my-6 max-w-full rounded-xl bg-secondary px-6 py-5">
                                <Text className="text-center text-sm italic text-tertiary">{closingJoke}</Text>
                            </Container>

                            {/* CTA */}
                            <Button href={dashboardUrl} className="mt-2">
                                <Text className="text-md font-semibold">View full dashboard →</Text>
                            </Button>
                        </Container>

                        {/* Footer */}
                        <Footer />
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    )
}

export default WeeklyDigest
