interface AttributionFooterProps {
    className?: string;
}

export function AttributionFooter({ className = "" }: AttributionFooterProps) {
    return (
        <footer className={`py-4 px-4 text-center text-slate-500 text-xs ${className}`}>
            <strong>Proprietary for Chandan Steel Ltd. Developed by Atharv Dhapre ( IT Dept ).</strong>
        </footer>
    );
}
