'use client';
import {
  RelativeTime,
  RelativeTimeZone,
  RelativeTimeZoneDate,
  RelativeTimeZoneDisplay,
} from '@/components/ui/kibo-ui/relative-time';
const timezones = [
  { label: 'GMT', zone: 'Europe/London' },
];
const Clock = () => (
  <div className="rounded-md border bg-background p-4">
    <RelativeTime>
      {timezones.map(({ zone }) => (
        <RelativeTimeZone key={zone} zone={zone}>

          <RelativeTimeZoneDate />
          <RelativeTimeZoneDisplay />
        </RelativeTimeZone>
      ))}
    </RelativeTime>
  </div>
);
export default Clock;