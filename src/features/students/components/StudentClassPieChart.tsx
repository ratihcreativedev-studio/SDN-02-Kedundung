"use client";

import * as React from "react";
import { PieChart, Pie, Cell } from "recharts";
import { Users, GraduationCap, School, Percent } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";

type ClassItem = {
  id: string;
  name: string;
  homeroom?: { name: string } | null;
  _count: { students: number };
};

type StudentClassPieChartProps = {
  classes: ClassItem[];
  totalStudents: number;
};

const PALETTE = [
  "#1e3a5f", // Deep Navy (Brand Primary)
  "#d4a843", // Warm Gold (Brand Secondary)
  "#0284c7", // Sky Blue
  "#10b981", // Emerald
  "#8b5cf6", // Purple
  "#f97316", // Warm Orange
  "#06b6d4", // Cyan
  "#ec4899", // Rose Pink
  "#14b8a6", // Teal
  "#6366f1", // Indigo
  "#eab308", // Amber
  "#64748b", // Slate
];

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload: {
      fill: string;
      name: string;
      percentage: number;
      homeroom: string;
      value: number;
    };
  }>;
}) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl border border-border bg-white/95 p-4 shadow-2xl backdrop-blur-md transition-all">
        <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-border/60">
          <span
            className="inline-block h-3.5 w-3.5 rounded-full ring-2 ring-white shadow-sm"
            style={{ backgroundColor: data.fill }}
          />
          <span className="font-bold text-primary text-base">
            {data.name}
          </span>
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between gap-4 bg-primary/5 px-2.5 py-1.5 rounded-lg border border-primary/10">
            <span className="font-semibold text-primary flex items-center gap-1.5">
              <Percent size={14} className="text-secondary" />
              Persentase:
            </span>
            <span className="font-black text-secondary text-sm">{data.percentage}%</span>
          </div>
          <div className="flex items-start gap-2 text-text-secondary pt-0.5">
            <GraduationCap size={15} className="mt-0.5 shrink-0 text-text-muted" />
            <div>
              <span className="font-semibold text-text-primary">Wali Kelas: </span>
              <span>{data.homeroom}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-text-secondary">
            <Users size={15} className="shrink-0 text-primary-light" />
            <div>
              <span className="font-semibold text-text-primary">Jumlah Siswa: </span>
              <span className="font-bold text-primary">{data.value} Siswa</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export function StudentClassPieChart({
  classes,
  totalStudents,
}: StudentClassPieChartProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  // Filter out non-student classes if any (e.g. "tim sekolah")
  const filteredClasses = React.useMemo(() => {
    return classes.filter(
      (cls) => cls.name.toLowerCase() !== "tim sekolah"
    );
  }, [classes]);

  const totalClassStudents = React.useMemo(() => {
    return filteredClasses.reduce((sum, cls) => sum + cls._count.students, 0);
  }, [filteredClasses]);

  const effectiveTotal = totalClassStudents > 0 ? totalClassStudents : totalStudents;

  // Prepare full data for cards
  const allClassData = React.useMemo(() => {
    return filteredClasses.map((cls, index) => {
      const count = cls._count.students;
      const percentage =
        effectiveTotal > 0 ? ((count / effectiveTotal) * 100).toFixed(1) : "0";
      const color = PALETTE[index % PALETTE.length];
      return {
        id: cls.id,
        name: cls.name,
        value: count,
        homeroom: cls.homeroom?.name || "Belum ditetapkan",
        percentage,
        fill: color,
      };
    });
  }, [filteredClasses, effectiveTotal]);

  // Data for the pie chart slices: only classes with active students (> 0)
  const chartSlices = React.useMemo(() => {
    const activeClasses = allClassData.filter((item) => item.value > 0);
    return activeClasses.length > 0 ? activeClasses : allClassData;
  }, [allClassData]);

  if (allClassData.length === 0) {
    return (
      <Card className="p-8 text-center bg-white shadow-sm">
        <School className="mx-auto h-12 w-12 text-text-muted mb-3" />
        <p className="text-base font-semibold text-text-primary">Belum ada data kelas</p>
        <p className="text-sm text-text-secondary mt-1">Data kelas akan muncul setelah ditambahkan di admin.</p>
      </Card>
    );
  }

  return (
    <Card className="border border-border/80 bg-white shadow-md overflow-hidden">
      <CardHeader className="border-b border-border/60 pb-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-primary flex items-center gap-2.5">
              <School className="h-6 w-6 text-secondary" />
              Data Siswa Aktif
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
              <Users size={14} />
              {effectiveTotal} Total Siswa
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Full Solid Pie Chart Section */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-full h-[320px] sm:h-[350px] max-w-[360px] flex items-center justify-center">
              <ChartContainer className="h-full w-full">
                <PieChart>
                  <ChartTooltip content={<CustomTooltip />} />
                  <Pie
                    data={chartSlices}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={0}
                    outerRadius={140}
                    paddingAngle={2}
                    isAnimationActive={false}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    {chartSlices.map((entry, index) => {
                      const isHovered = activeIndex === index;
                      return (
                        <Cell
                          key={`cell-${entry.id}`}
                          fill={entry.fill}
                          stroke="#ffffff"
                          strokeWidth={isHovered ? 3 : 2}
                          className="transition-all duration-200 cursor-pointer"
                          style={{
                            opacity: activeIndex === null || isHovered ? 1 : 0.45,
                            filter: isHovered ? "brightness(1.08) drop-shadow(0 4px 8px rgba(0,0,0,0.15))" : "none",
                          }}
                        />
                      );
                    })}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
          </div>

          {/* Class Breakdown List with Percentages & Homeroom Teachers */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {allClassData.map((cls, index) => {
                const isActive = activeIndex === index;
                const pctNumber = parseFloat(cls.percentage);

                return (
                  <div
                    key={cls.id}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                    className={`rounded-xl border p-3.5 transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "border-primary/50 bg-primary/5 shadow-md -translate-y-0.5"
                        : "border-border bg-white hover:border-border hover:bg-surface-alt/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="h-3.5 w-3.5 shrink-0 rounded-md"
                          style={{ backgroundColor: cls.fill }}
                        />
                        <span className="font-bold text-primary truncate text-sm">
                          {cls.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                          {cls.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar reflecting percentage */}
                    <div className="mt-2.5 w-full bg-surface-alt rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pctNumber}%`,
                          backgroundColor: cls.fill,
                        }}
                      />
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-xs text-text-secondary pt-1.5 border-t border-border/40">
                      <div className="flex items-center gap-1.5 truncate pr-2">
                        <GraduationCap size={13} className="shrink-0 text-text-muted" />
                        <span className="truncate" title={cls.homeroom}>
                          {cls.homeroom}
                        </span>
                      </div>
                      <span className="shrink-0 font-bold text-text-secondary text-xs">
                        {cls.value} Siswa
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
