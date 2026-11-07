import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });
    const submit = (e) => { e.preventDefault(); post(route('password.email')); };

    return (
        <GuestLayout title="Forgot your password?" subtitle="Enter your email and we’ll send a secure reset link.">
            <Head title="Forgot Password" />
            {status && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800" role="status">{status}</div>}
            <form onSubmit={submit} className="space-y-4">
                <div><InputLabel htmlFor="email" value="Email" /><TextInput id="email" type="email" name="email" value={data.email} className="mt-1 block w-full" isFocused={true} onChange={(e) => setData('email', e.target.value)} required /><InputError message={errors.email} className="mt-2" /></div>
                <div className="flex items-center justify-between gap-3"><Link href={route('login')} className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">Back to log in</Link><PrimaryButton disabled={processing}>{processing ? 'Sending…' : 'Email reset link'}</PrimaryButton></div>
            </form>
        </GuestLayout>
    );
}
