<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;
use Throwable;

class DonationReviewedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * @var array<int, int>
     */
    public $backoff = [30, 120, 300];

    public $tries = 3;

    public function __construct(
        public string $status,
        public string $donorName,
        public string $amount,
        public ?string $reviewNote,
        public string $trackingUrl,
    ) {
        $this->afterCommit = true;
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $approved = $this->status === 'approved';

        $message = (new MailMessage)
            ->subject($approved ? 'WeCare: Donation approved / လှူဒါန်းမှု အတည်ပြုပြီး' : 'WeCare: Donation update / လှူဒါန်းမှု အခြေအနေ')
            ->greeting($approved ? "Hello {$this->donorName}," : "Hello {$this->donorName},")
            ->line($approved
                ? "Your donation of MMK {$this->amount} has been approved. Thank you for supporting elders through WeCare Myanmar."
                : "Your donation of MMK {$this->amount} could not be approved at this time.")
            ->line($approved
                ? "သင့်လှူဒါန်းမှု MMK {$this->amount} ကို အတည်ပြုပြီးပါပြီ။ WeCare Myanmar မှတစ်ဆင့် သက်ကြီးရွယ်အိုများကို ကူညီပေးသည့်အတွက် ကျေးဇူးတင်ပါသည်။"
                : "သင့်လှူဒါန်းမှု MMK {$this->amount} ကို ယခုအချိန်တွင် အတည်မပြုနိုင်သေးပါ။");

        if (filled($this->reviewNote)) {
            $message->line('Note from the team / အဖွဲ့မှ မှတ်ချက်: '.$this->reviewNote);
        }

        return $message
            ->action($approved ? 'View status / အခြေအနေကြည့်ရန်' : 'Check status / အခြေအနေစစ်ရန်', $this->trackingUrl)
            ->line('If you need help, contact care@wecaremyanmar.org. / အကူအညီလိုပါက care@wecaremyanmar.org သို့ ဆက်သွယ်ပါ။');
    }

    public function failed(Throwable $exception): void
    {
        Log::warning('Donation review notification failed', [
            'status' => $this->status,
            'tracking_url' => $this->trackingUrl,
            'error' => $exception->getMessage(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'status' => $this->status,
            'review_note' => $this->reviewNote,
        ];
    }
}
