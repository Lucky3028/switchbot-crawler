import { formatRFC3339 } from 'date-fns';

const postToDiscord = (webhookUrl: string, body: unknown) =>
  fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

export const notifyAirConditionerOnToDiscord = async (webhookUrl: string, utcNow: Date, currentTemp: number) => {
  const body = {
    embeds: [
      {
        title: 'エアコンをONにしました',
        description: '室温が指定の気温を上回ったことを確認したため、エアコンをONにしました。',
        timestamp: formatRFC3339(utcNow),
        color: 5620992,
        fields: [{ name: '現在の気温', value: `${currentTemp}℃`, inline: true }],
      },
    ],
  };

  const response = await postToDiscord(webhookUrl, body);

  if (!response.ok) {
    throw new Error('discord error');
  }

  return response;
};
