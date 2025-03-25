"use client";

import { useState, useEffect } from "react";
import {
  SchoolApplicationsTable,
  type SchoolApplicationData,
} from "@/components/school-applications-table";
import {
  DepartmentApplicationsTable,
  type DepartmentApplicationData,
} from "@/components/department-applications-table";
import {
  AreaApplicationsTable,
  type AreaApplicationData,
} from "@/components/area-applications-table";
import { httpClient } from "@/plugins/http-client-flask";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/simple-loading";

export default function SummaryPage() {
  const [schoolData, setSchoolData] = useState<SchoolApplicationData[]>([]);
  const [isLoadingSchool, setIsLoadingSchool] = useState(true);
  const [departmentData, setDepartmentData] = useState<
    DepartmentApplicationData[]
  >([]);
  const [isLoadingDepartment, setIsLoadingDepartment] = useState(true);
  const [areaData, setAreaData] = useState<AreaApplicationData[]>([]);
  const [isLoadingArea, setIsLoadingArea] = useState(true);

  useEffect(() => {
    httpClient
      .get("report.php?query=getSchoolsData")
      .then((response) => {
        setSchoolData(response.data);
        setIsLoadingSchool(false);
      })
      .catch((error) => {
        console.error(error);
      });

    httpClient
      .get("report.php?query=getDepartmentsData")
      .then((response) => {
        setDepartmentData(response.data);
        setIsLoadingDepartment(false);
      })
      .catch((error) => {
        console.error(error);
      });

    httpClient
      .get("report.php?query=getAreaData")
      .then((response) => {
        setAreaData(response.data);
        setIsLoadingArea(false);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-center text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-700 bg-clip-text text-transparent">
        GEN Academy Başvuru İstatistikleri
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {isLoadingSchool ? (
          <Skeleton className="h-96 w-full bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-lg">
            <Spinner className="ml-2">
              Universite Başvuruları
              <br />
              <span className="text-sm text-gray-400">
                (Universite başvuruları yükleniyor...)
              </span>
              Yükleniyor...
            </Spinner>
          </Skeleton>
        ) : (
          <SchoolApplicationsTable data={schoolData} />
        )}

        {isLoadingDepartment ? (
          <Skeleton className="h-96 w-full bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-lg">
            <Spinner className="ml-2">
              Bolum Başvuruları
              <br />
              <span className="text-sm text-gray-400">
                (Bolum başvuruları yükleniyor...)
              </span>
              Yükleniyor...
            </Spinner>
          </Skeleton>
        ) : (
          <DepartmentApplicationsTable data={departmentData} />
        )}

        {isLoadingArea ? (
          <Skeleton className="h-96 w-full bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-lg">
            <Spinner className="ml-2">
              Bolum Analizleri
              <br />
              <span className="text-sm text-gray-400">
                (Bolum Analizleri başvuruları yükleniyor...)
              </span>
              Yükleniyor...
            </Spinner>
          </Skeleton>
        ) : (
          <AreaApplicationsTable data={areaData} />
        )}
      </div>
    </div>
  );
}
