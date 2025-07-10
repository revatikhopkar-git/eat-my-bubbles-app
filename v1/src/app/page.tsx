/* File: app/page.tsx */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";

// Types

type Event = 
  | '50 Freestyle' | '100 Freestyle' | '200 Freestyle' | '500 Freestyle'
  | '100 Butterfly' | '200 Butterfly'
  | '100 Breastroke' | '200 Breastroke'
  | '100 Backstroke' | '200 Backstroke'
  | '200 IM';

type Course = 'SCY' | 'LCM';
type StandardLevel = 'Regionals' | 'State';

type SwimmerTime = {
  time: number;
  meet: string;
  date: string;
};

type SwimmerData = {
  [course in Course]: {
    [event in Event]?: SwimmerTime;
  };
};

type Standards = {
  [level in StandardLevel]: {
    [course in Course]: {
      [event in Event]?: number;
    };
  };
};

const eventOrder: Event[] = ['50 Freestyle','100 Freestyle','200 Freestyle','500 Freestyle','100 Butterfly','200 Butterfly','100 Breastroke','200 Breastroke','100 Backstroke','200 Backstroke','200 IM'];
const courses: Course[] = ['SCY', 'LCM'];

function parseTime(str: string | undefined): number | null {
  if (!str || str.toLowerCase() === 'dq') return null;
  const parts = str.split(':').map(parseFloat);
  return parts.reduce((acc, val) => acc * 60 + val);
}

function toTimeStr(seconds: number | null | undefined): string {
  if (seconds == null) return '-';
  const min = Math.floor(seconds / 60);
  const sec = (seconds % 60).toFixed(2).padStart(5, '0');
  return min > 0 ? `${min}:${sec}` : `${sec}`;
}

export default function SwimApp() {
  const [event, setEvent] = useState<Event>('50 Freestyle');
  const [course, setCourse] = useState<Course>('SCY');
  const [swimmerData, setSwimmerData] = useState<SwimmerData | null>(null);
  const [standards, setStandards] = useState<Standards | null>(null);
  const [age, setAge] = useState<number | null>(null);

  useEffect(() => {
    const fetchCSV = async (url: string) => {
      const response = await fetch(url);
      const text = await response.text();
      const [headerLine, ...lines] = text.trim().split('\n');
      const headers = headerLine.split(',');
      return lines.map(line => {
        const values = line.split(',');
        return headers.reduce((obj: any, header, i) => {
          obj[header.trim()] = values[i]?.trim();
          return obj;
        }, {});
      });
    };

    const loadData = async () => {
      const swimCSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR517EAit_Mv_l2LJa7TbXINy5Eq-v9fa9kwF8QX0ZUk8GG2pRbtBjPzM4vN8X00w/pub?gid=1331787204&single=true&output=csv';
      const standardsCSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS8azb2ync4URwqJmg9XiYUqVH9IMsHkbVYSf71e8lwIgrqOlB9ezp4HHYhDbG_gw/pub?gid=1081039398&single=true&output=csv';

      const swimData = await fetchCSV(swimCSV);
      const stdData = await fetchCSV(standardsCSV);

      const dobStr = swimData[0]?.swimmer_date_of_birth;
      if (dobStr) {
        const dob = new Date(dobStr);
        const today = new Date();
        let calculatedAge = today.getFullYear() - dob.getFullYear();
        const hasBirthdayPassed = today.getMonth() > dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
        if (!hasBirthdayPassed) calculatedAge--;
        setAge(calculatedAge);
      }

      const pb: SwimmerData = { SCY: {}, LCM: {} };
      swimData.forEach((r: any) => {
        const c = r.Course as Course, e = r.Event as Event, t = parseTime(r['Final Time']);
        if (!c || !e || !t) return;
        if (!pb[c][e] || pb[c][e]!.time > t) {
          pb[c][e] = { time: t, meet: r['meet_name'], date: r['event_date'] };
        }
      });

      const std: Standards = { Regionals: { SCY: {}, LCM: {} }, State: { SCY: {}, LCM: {} } };
      stdData.forEach((r: any) => {
        const s = r.Standard as StandardLevel, c = r.Course as Course, e = r.Event as Event;
        const t = parseTime(r.Time);
        if (s && c && e && t) std[s][c][e] = t;
      });

      setSwimmerData(pb);
      setStandards(std);
    };

    loadData();
  }, []);

  if (!swimmerData || !standards || age === null) return <div className="text-center mt-20">Loading...</div>;

  const renderCard = (level: StandardLevel) => {
    const pb = swimmerData[course][event]?.time;
    const std = standards[level][course][event];
    const met = pb != null && std != null && pb <= std;

    return (
      <Card className={`max-w-xl mx-auto my-4 shadow-xl border transition duration-300 ${met ? 'bg-teal-100 border-teal-400' : 'bg-rose-100 border-rose-300'}`}>
        <CardContent className="p-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-zinc-800">{level} Standard</h2>
            {met ? <CheckCircle className="text-teal-600" /> : <XCircle className="text-rose-500" />}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-zinc-700">
            <div><span className="font-medium">Standard:</span> {toTimeStr(std)}</div>
            <div><span className="font-medium">Best Time:</span> {toTimeStr(pb)}</div>
          </div>
          <div className="mt-3 text-sm text-zinc-500">
            {met ? "Qualified" : pb && std ? `Needs ${(pb - std).toFixed(2)}s to qualify` : "No time available"}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-[url('/water-bg.jpg')] bg-cover bg-center px-4 py-8 font-sans relative">
      <div className="absolute top-4 left-4">
        <Image
          src="/eat-my-bubbles-logo.png"
          alt="Eat My Bubbles Logo"
          width={50}
          height={50}
          className="rounded-full shadow-md"
        />
      </div>

      <div className="max-w-2xl mx-auto backdrop-blur-md bg-white/70 rounded-xl p-6">
        <h1 className="text-5xl font-extrabold text-center mb-3 text-blue-900 tracking-tight leading-tight">Eat My Bubbles</h1>
        <h2 className="text-lg font-medium text-center mb-6 text-zinc-700">Saanvi Khopkar, Age {age}</h2>

        <div className="flex flex-col md:flex-row gap-4 justify-center mb-6">
          <Select value={event} onValueChange={(val: string) => setEvent(val as Event)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Event" />
            </SelectTrigger>
            <SelectContent>
              {eventOrder.map(ev => <SelectItem key={ev} value={ev}>{ev}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={course} onValueChange={(val: string) => setCourse(val as Course)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="Regionals">
          <TabsList className="flex justify-center bg-zinc-100 rounded-xl p-1 mb-4">
            <TabsTrigger value="Regionals" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-4 py-2 rounded-lg transition">Regionals</TabsTrigger>
            <TabsTrigger value="State" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-4 py-2 rounded-lg transition">State</TabsTrigger>
          </TabsList>
          <TabsContent value="Regionals">{renderCard("Regionals")}</TabsContent>
          <TabsContent value="State">{renderCard("State")}</TabsContent>
        </Tabs>
      </div>

      <div className="fixed bottom-4 right-4 bg-blue-700 text-white px-4 py-2 rounded-full text-sm shadow-lg animate-bounce">
        Last Updated Today
      </div>
    </div>
  );
}
