export const SAMPLE_REVERT = {
  emailsSent: 4,
  opens: 3,
  clicks: 1,
  replies: 1,
  headline:
    'This lead has opened multiple emails and clicked once. A concise, personalized follow-up is recommended before marking the lead cold.',
  events: [
    {
      status: 'sent',
      title: 'Initial outreach sent',
      detail: 'Introductory email delivered using the Initial Outreach template.',
      date: 'May 24'
    },
    {
      status: 'opened',
      title: 'Email opened',
      detail: 'Lead opened the message twice from a desktop client.',
      date: 'May 25'
    },
    {
      status: 'clicked',
      title: 'CTA clicked',
      detail: 'Lead clicked the booking link but did not complete the form.',
      date: 'May 26'
    },
    {
      status: 'replied',
      title: 'Reply detected',
      detail: 'Lead asked for more details about timelines and pricing.',
      date: 'May 27'
    }
  ]
};
