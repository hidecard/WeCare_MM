export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-full border border-transparent bg-[#065F46] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition duration-150 ease-in-out hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 active:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60 ${
                    disabled ? 'opacity-60' : ''
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
