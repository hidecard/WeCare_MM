export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'h-4 w-4 rounded border-slate-300 text-emerald-700 shadow-sm transition focus:ring-emerald-500 ' +
                className
            }
        />
    );
}
