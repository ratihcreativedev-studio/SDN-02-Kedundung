import { classQueries } from "@/features/classes/queries";
import { studentService } from "@/features/students/services";
import { Users } from "lucide-react";
import { StudentSearchByNisn } from "@/features/students/components/StudentSearchByNisn";
import { StudentClassPieChart } from "@/features/students/components/StudentClassPieChart";

export const revalidate = 3600;

export default async function DataSiswaPage() {
  const [classes, students] = await Promise.all([
    classQueries.findAll().catch((error) => {
      console.error("Gagal memuat data kelas dari database:", error);
      return [];
    }),
    studentService.getAll().catch((error) => {
      console.error("Gagal memuat data siswa dari database:", error);
      return [];
    }),
  ]);

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="page-hero">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary sm:text-4xl">
                Statistik Peserta Didik
              </h1>
              <p className="text-sm text-text-secondary sm:text-base">
                Ringkasan data siswa aktif berdasarkan kelas, diperbarui dari dashboard admin.
              </p>
            </div>
          </div>
        </div>
        
        <StudentSearchByNisn />
        
        <StudentClassPieChart classes={classes} totalStudents={students.length} />
      </div>
    </div>
  );
}
