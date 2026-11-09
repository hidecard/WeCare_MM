<?php

namespace App\Support;

use Illuminate\Http\Request;

class PublicSeo
{
    /**
     * @return array{title: array{my: string, en: string}, description: array{my: string, en: string}, canonical: ?string, index: bool, json_ld: array{my: array<string, mixed>, en: array<string, mixed>}|null}|null
     */
    public static function forRequest(Request $request): ?array
    {
        $route = $request->route()?->getName();

        return match ($route) {
            'home' => self::page('home', 'home', true, true),
            'about' => self::page('about', 'about', true),
            'donate' => self::page('donate', 'donate', true),
            'impact' => self::page('impact', 'impact', true),
            'impact.monthly' => self::page('monthlyImpact', 'impact.monthly', true),
            'outreach' => self::page('outreach', 'outreach', true),
            'community' => self::page('community', 'community', true),
            'leaderboard' => self::page('leaderboard', 'leaderboard', true),
            'help' => self::page('help', 'help', true),
            'privacy-policy' => self::page('privacyPolicy', 'privacy-policy', true),
            'terms' => self::page('terms', 'terms', true),
            'data-handling' => self::page('dataHandling', 'data-handling', true),
            'donations.status-page' => self::page('donationStatus', 'donations.status-page', false),
            'spot-reports.status-page' => self::page('spotReportStatus', 'spot-reports.status-page', false),
            'donations.certificate' => self::page('certificate', null, false),
            default => null,
        };
    }

    /**
     * @return array{title: array{my: string, en: string}, description: array{my: string, en: string}, canonical: ?string, index: bool, json_ld: null}
     */
    public static function error(): array
    {
        return self::page('error', null, false);
    }

    /**
     * @return array{title: array{my: string, en: string}, description: array{my: string, en: string}, canonical: ?string, index: bool, json_ld: array{my: array<string, mixed>, en: array<string, mixed>}|null}
     */
    private static function page(string $key, ?string $routeName, bool $index, bool $withJsonLd = false): array
    {
        $copy = self::copy()[$key];
        $canonical = $routeName ? route($routeName) : null;

        return [
            'title' => $copy['title'],
            'description' => $copy['description'],
            'canonical' => $canonical,
            'index' => $index,
            'json_ld' => $withJsonLd ? self::organization($copy['description'], (string) $canonical) : null,
        ];
    }

    /**
     * @param  array{my: string, en: string}  $description
     * @return array{my: array<string, mixed>, en: array<string, mixed>}
     */
    private static function organization(array $description, string $url): array
    {
        return [
            'my' => self::organizationNode($description['my'], $url),
            'en' => self::organizationNode($description['en'], $url),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function organizationNode(string $description, string $url): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'NGO',
            'name' => 'WeCare Myanmar',
            'url' => $url,
            'description' => $description,
            'areaServed' => 'Myanmar',
            'knowsLanguage' => ['my', 'en'],
        ];
    }

    /**
     * @return array<string, array{title: array{my: string, en: string}, description: array{my: string, en: string}}>
     */
    private static function copy(): array
    {
        return [
            'home' => [
                'title' => ['my' => 'မူလစာမျက်နှာ', 'en' => 'Home'],
                'description' => [
                    'my' => 'လမ်းဘေးရှိ သက်ကြီးရွယ်အိုများအတွက် အစားအစာ၊ ဆေးဝါးနှင့် စောင့်ရှောက်မှုကို တိုက်ရိုက်ပို့သော WeCare Myanmar။ လှူဒါန်းမှုကို ခြေရာခံနိုင်သည်။',
                    'en' => 'WeCare Myanmar brings meals, medicine, and direct care to elders living on the street. You can track every gift.',
                ],
            ],
            'donate' => [
                'title' => ['my' => 'လှူဒါန်းရန်', 'en' => 'Donate'],
                'description' => [
                    'my' => 'ရန်ပုံငွေရွေးပါ၊ ပမာဏသတ်မှတ်ပါ၊ ငွေလွှဲပြေစာတင်ပြီး သက်ကြီးရွယ်အိုများအတွက် တိုက်ရိုက်လှူဒါန်းပါ။',
                    'en' => 'Choose a fund, set an amount, and upload your payment slip to support elders directly.',
                ],
            ],
            'about' => [
                'title' => ['my' => 'ကျွန်ုပ်တို့အကြောင်း', 'en' => 'About WeCare'],
                'description' => [
                    'my' => 'WeCare Myanmar ၏ ရည်မှန်းချက်၊ မျှော်မှန်းချက်၊ တန်ဖိုးထားမှုများနှင့် တည်ထောင်ရသည့် အကြောင်းရင်းကို လေ့လာပါ။',
                    'en' => 'Learn about WeCare Myanmar’s goal, mission, vision, values, and why it was founded.',
                ],
            ],
            'privacyPolicy' => [
                'title' => ['my' => 'ကိုယ်ရေးအချက်အလက် မူဝါဒ', 'en' => 'Privacy Policy'],
                'description' => [
                    'my' => 'WeCare Myanmar သည် လှူဒါန်းမှု၊ သတင်းပေးမှုနှင့် ဆက်သွယ်ရာတွင် စုဆောင်းသော ကိုယ်ရေးအချက်အလက်များကို မည်သို့ အသုံးပြု၊ ကာကွယ်၊ သိမ်းဆည်းသည်ကို ဖော်ပြပါသည်။',
                    'en' => 'How WeCare Myanmar collects, uses, protects, and retains personal information for donations, reports, and contact.',
                ],
            ],
            'terms' => [
                'title' => ['my' => 'အသုံးပြုမှုနှင့် လှူဒါန်းမှု မူဝါဒ', 'en' => 'Terms & Donation Policy'],
                'description' => [
                    'my' => 'WeCare Myanmar ဝဘ်ဆိုက် အသုံးပြုမှု၊ လှူဒါန်းမှု တင်သွင်းခြင်း၊ အတည်ပြုခြင်းနှင့် တာဝန်ကန့်သတ်ချက်များဆိုင်ရာ မူဝါဒများ။',
                    'en' => 'Terms for using WeCare Myanmar and policies for submitting, reviewing, and processing donations.',
                ],
            ],
            'dataHandling' => [
                'title' => ['my' => 'အချက်အလက် ကိုင်တွယ်မှု', 'en' => 'Data Handling'],
                'description' => [
                    'my' => 'ငွေလွှဲပြေစာ၊ ဖုန်းနံပါတ်၊ အီးမေးလ်နှင့် ဓာတ်ပုံများကို မည်သူမြင်နိုင်သည်၊ မည်မျှကြာ သိမ်းဆည်းသည်၊ မည်သို့ ကာကွယ်သည်ကို ရှင်းလင်းဖော်ပြပါသည်။',
                    'en' => 'How WeCare Myanmar handles payment slips, phone numbers, email addresses, and photos, including access, retention, and protection.',
                ],
            ],
            'impact' => [
                'title' => ['my' => 'အကျိုးသက်ရောက်မှု', 'en' => 'Impact'],
                'description' => [
                    'my' => 'အတည်ပြုပြီး အလှူ၊ ကုန်ကျစရိတ်၊ လက်ကျန်နှင့် ကွင်းဆင်းခရီးများကို မှတ်တမ်းအစစ်ကနေ ကြည့်ပါ။',
                    'en' => 'See approved donations, recorded expenses, the balance, and outreach trips from real records.',
                ],
            ],
            'monthlyImpact' => [
                'title' => ['my' => 'လစဉ် အကျိုးသက်ရောက်မှုအစီရင်ခံစာ', 'en' => 'Monthly impact report'],
                'description' => [
                    'my' => 'အတည်ပြုပြီးသော အလှူ၊ ကုန်ကျစရိတ်၊ ကွင်းဆင်းခရီးနှင့် ကူညီခဲ့သူများကို လစဉ်အလိုက် ပွင့်လင်းစွာ ကြည့်ရှုပါ။',
                    'en' => 'Review approved donations, expenses, outreach trips, and people helped for each month.',
                ],
            ],
            'outreach' => [
                'title' => ['my' => 'လမ်းဘေးကူညီရေး', 'en' => 'Outreach'],
                'description' => [
                    'my' => 'မြို့နယ်အလိုက် ကွင်းဆင်းခရီး၊ ကူညီခဲ့သူအရေအတွက်နှင့် ဓာတ်ပုံအစစ်များကို ကြည့်ပါ။',
                    'en' => 'Browse outreach trips by township, with the people helped and the real photos from each visit.',
                ],
            ],
            'community' => [
                'title' => ['my' => 'အသိုက်အဝန်း', 'en' => 'Community'],
                'description' => [
                    'my' => 'အကူအညီလိုသူတွေ့ရင် မြို့နယ်၊ နေရာနှင့် ဖုန်းနံပါတ်ပို့ပါ။ စေတနာ့ဝန်ထမ်းအဖြစ်လည်း ပါဝင်နိုင်သည်။',
                    'en' => 'Report someone who needs help with a township, place, and phone number, or join as a volunteer.',
                ],
            ],
            'leaderboard' => [
                'title' => ['my' => 'လှူဒါန်းသူ ဂုဏ်ပြုစာရင်း', 'en' => 'Donor recognition wall'],
                'description' => [
                    'my' => 'အတည်ပြုပြီး လှူဒါန်းမှုများကို စုစုပေါင်းအလိုက် အဆင့်သတ်မှတ်ထားသည်။',
                    'en' => 'Approved donations, ranked by total given.',
                ],
            ],
            'help' => [
                'title' => ['my' => 'အကူအညီနှင့် ဆက်သွယ်ရန်', 'en' => 'Help & support'],
                'description' => [
                    'my' => 'လှူဒါန်းခြင်း၊ ငွေလွှဲပြေစာ၊ ခြေရာခံခြင်း၊ သတင်းပေးခြင်းနှင့် စေတနာ့ဝန်ထမ်းကိစ္စများအတွက် မေးလေ့ရှိသောမေးခွန်းများနှင့် ဆက်သွယ်ရန်လမ်းကြောင်းများ။',
                    'en' => 'Answers and support contacts for donations, payment slips, tracking, reports, and volunteering.',
                ],
            ],
            'donationStatus' => [
                'title' => ['my' => 'လှူဒါန်းမှုအခြေအနေ', 'en' => 'Donation status'],
                'description' => [
                    'my' => 'လှူဒါန်းမှုအမှတ်ဖြင့် အတည်ပြုချက်နှင့် အဖွဲ့မှ မှတ်ချက်ကို စစ်ပါ။',
                    'en' => 'Check a donation with its tracking ID, including the review result and any note from the team.',
                ],
            ],
            'spotReportStatus' => [
                'title' => ['my' => 'သတင်းပေးမှုအခြေအနေ', 'en' => 'Report status'],
                'description' => [
                    'my' => 'သတင်းပေးမှုအမှတ်ဖြင့် အကူအညီတောင်းထားမှု ဘယ်အဆင့်ရောက်နေလဲ စစ်ပါ။',
                    'en' => 'Check a community report with its reference code and see the current follow-up stage.',
                ],
            ],
            'certificate' => [
                'title' => ['my' => 'ကျေးဇူးတင်လွှာ', 'en' => 'Donation certificate'],
                'description' => [
                    'my' => 'အတည်ပြုထားသော လှူဒါန်းမှုအတွက် WeCare Myanmar ကျေးဇူးတင်လွှာ။',
                    'en' => 'WeCare Myanmar appreciation certificate for an approved donation.',
                ],
            ],
            'error' => [
                'title' => ['my' => 'စာမျက်နှာမတွေ့ပါ', 'en' => 'Page not available'],
                'description' => [
                    'my' => 'ရှာနေသော စာမျက်နှာကို ဖွင့်၍မရပါ။ မူလစာမျက်နှာမှ ပြန်သွားနိုင်သည်။',
                    'en' => 'This page could not be opened. You can return to the WeCare Myanmar home page.',
                ],
            ],
        ];
    }
}
