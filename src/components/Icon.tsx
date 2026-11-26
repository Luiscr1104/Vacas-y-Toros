type IconName = 'arrow' | 'back' | 'sound' | 'mute' | 'trophy' | 'close' | 'help' | 'users' | 'spark' | 'clock' | 'delete';

export default function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
    const paths: Record<IconName, React.ReactNode> = {
        arrow: <><path d="M4 12h15m-6-6 6 6-6 6" /></>,
        back: <><path d="M20 12H5m6-6-6 6 6 6" /></>,
        sound: <><path d="m11 4-6 5H2v6h3l6 5Zm5 4q4 4 0 8m3-11q7 7 0 14" /></>,
        mute: <><path d="m11 4-6 5H2v6h3l6 5Zm5 5 6 6m0-6-6 6" /></>,
        trophy: <><path d="M7 3h10v7a5 5 0 0 1-10 0Zm0 2H3v3a4 4 0 0 0 4 4m10-7h4v3a4 4 0 0 1-4 4m-5 3v6m-5 0h10" /></>,
        close: <path d="m6 6 12 12M6 18 18 6" />,
        help: <><circle cx="12" cy="12" r="9" /><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 5m0 3h.01" /></>,
        users: <><circle cx="9" cy="8" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3m1-16a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5" /></>,
        spark: <path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" />,
        clock: <><circle cx="12" cy="12" r="9" /><path d="M12 6v6l4 2" /></>,
        delete: <><path d="M9 5h12v14H9l-7-7Zm4 4 5 6m0-6-5 6" /></>,
    };
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
