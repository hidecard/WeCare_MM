<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DonationReviewedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $status,
        public string $donorName,
        public string $amount,
        public ?string $reviewNote,
        public string $trackingUrl,
    ) {}

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
            ->subject($approved ? 'WeCare donation approved' : 'WeCare donation not approved')
            ->greeting('Hello '.$this->donorName)
            ->line($approved
                ? 'သင့်လှူဒါန်းမှု '.$this->amount.' ကျပ်ကို အတည်ပြုပြီးပါပြီ။'
                : 'သင့်လှူဒါန်းမှု '.$this->amount.' ကျပ်ကို အတည်မပြုနိုင်ပါ။')
            ->line($approved
                ? 'Your donation of MMK '.$this->amount.' has been approved.'
                : 'Your donation of MMK '.$this->amount.' was not approved.');

        if (filled($this->reviewNote)) {
            $message->line('အဖွဲ့မှ မှတ်ချက် / Note from the team: '.$this->reviewNote);
        }

        return $message
            ->action('Check donation status', $this->trackingUrl)
            ->line('WeCare ကို ပံ့ပိုးပေးသည့်အတွက် ကျေးဇူးတင်ပါသည်။');
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
