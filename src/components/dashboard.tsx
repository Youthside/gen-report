"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  Area,
  AreaChart,
  Treemap,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import {
  Download,
  Filter,
  Users,
  GraduationCap,
  BookOpen,
  Search,
  TrendingUp,
  BarChart3,
  PieChartIcon,
  LineChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  CalendarIcon,
  ChevronDown,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import useDataManager from "@/hooks/use-data-manager";
import { PremiumDataTable } from "./premium-data-table";

export default function Dashboard() {
  const { allData, loading } = useDataManager();
  //@ts-ignore
  const [activeTab, setActiveTab] = useState("özet");
  const [searchTerm, setSearchTerm] = useState("");
  const [educationFilter, setEducationFilter] = useState("all");
  const [universityFilter, setUniversityFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  //@ts-ignore
  const [currentPage, setCurrentPage] = useState(1);
  const [chartType, setChartType] = useState("bar");

  const requestAllDataAsync = () => {
    return allData;
  };
  // Veri yükleme
  useEffect(() => {
    requestAllDataAsync();
  }, [requestAllDataAsync]);

  // Tarih aralığı hızlı seçim fonksiyonları
  const setDateRangeToday = () => {
    const today = new Date();
    setDateRange({ from: today, to: today });
  };

  const setDateRangeYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    setDateRange({ from: yesterday, to: yesterday });
  };

  const setDateRangeLast7Days = () => {
    const today = new Date();
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 6);
    setDateRange({ from: last7Days, to: today });
  };

  const setDateRangeLast30Days = () => {
    const today = new Date();
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 29);
    setDateRange({ from: last30Days, to: today });
  };

  const setDateRangeThisMonth = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setDateRange({ from: firstDayOfMonth, to: today });
  };

  const setDateRangeLastMonth = () => {
    const today = new Date();
    const firstDayOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const lastDayOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      0
    );
    setDateRange({ from: firstDayOfLastMonth, to: lastDayOfLastMonth });
  };

  const clearDateRange = () => {
    setDateRange({ from: undefined, to: undefined });
  };

  // Filtrelenmiş veri
  const filteredData = useMemo(() => {
    return allData.filter((student) => {
      // Arama filtresi
      const searchMatch =
        searchTerm === "" ||
        (student.Ad || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.Soyad || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (student.Universite || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (student.Bolum || "").toLowerCase().includes(searchTerm.toLowerCase());

      // Eğitim durumu filtresi
      const educationMatch =
        educationFilter === "all" || student.Egitim_Durumu === educationFilter;

      // Universite filtresi
      const universityMatch =
        universityFilter === "all" || student.Universite === universityFilter;

      // Ders filtresi
      const courseMatch =
        courseFilter === "all" ||
        (student.Aldigi_Dersler || "").includes(courseFilter);

      // Tarih aralığı filtresi
      let dateMatch = true;
      if (dateRange.from && dateRange.to) {
        const studentDate = student.Tarih ? new Date(student.Tarih) : null;
        if (!studentDate || isNaN(studentDate.getTime())) return false;

        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);

        dateMatch = studentDate >= fromDate && studentDate <= toDate;
      }

      return (
        searchMatch &&
        educationMatch &&
        universityMatch &&
        courseMatch &&
        dateMatch
      );
    });
  }, [
    allData,
    searchTerm,
    educationFilter,
    universityFilter,
    courseFilter,
    dateRange,
  ]);

  // Veri analizi fonksiyonları
  const analyzeEducationStatus = useMemo(() => {
    const statusCount: Record<string, number> = {};
    filteredData.forEach((student) => {
      const status = student.Egitim_Durumu;
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    return Object.entries(statusCount)
      .map(([name, value]) => ({
        name,
        value,
        percent: ((value / filteredData.length) * 100).toFixed(1),
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  const analyzeClasses = useMemo(() => {
    const classCount: Record<string, number> = {};
    filteredData.forEach((student) => {
      const className = student.Sinif;
      classCount[className] = (classCount[className] || 0) + 1;
    });

    return Object.entries(classCount)
      .map(([name, value]) => ({
        name,
        value,
        percent: ((value / filteredData.length) * 100).toFixed(1),
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  const analyzeCourses = useMemo(() => {
    const courseCount: Record<string, number> = {};

    filteredData.forEach((student) => {
      const courses = (student.Aldigi_Dersler || "").split(", ");
      courses.forEach((course) => {
        courseCount[course] = (courseCount[course] || 0) + 1;
      });
    });

    return Object.entries(courseCount)
      .map(([name, value]) => ({
        name,
        value,
        percent: ((value / filteredData.length) * 100).toFixed(1),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 kurslar
  }, [filteredData]);

  const analyzeUniversities = useMemo(() => {
    const uniCount: Record<string, number> = {};
    filteredData.forEach((student) => {
      const uni = student.Universite;
      uniCount[uni] = (uniCount[uni] || 0) + 1;
    });

    return Object.entries(uniCount)
      .map(([name, value]) => ({
        name,
        value,
        percent: ((value / filteredData.length) * 100).toFixed(1),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 üniversiteler
  }, [filteredData]);

  const analyzeDepartments = useMemo(() => {
    const deptCount: Record<string, number> = {};
    filteredData.forEach((student) => {
      const dept = student.Bolum;
      deptCount[dept] = (deptCount[dept] || 0) + 1;
    });

    return Object.entries(deptCount)
      .map(([name, value]) => ({
        name,
        value,
        percent: ((value / filteredData.length) * 100).toFixed(1),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 bölümler
  }, [filteredData]);

  const analyzeTimeSeries = useMemo(() => {
    // Aylara göre kayıt sayısı
    const monthlyData: Record<
      string,
      { month: string; count: number; courses: Record<string, number> }
    > = {};

    filteredData.forEach((student) => {
      const date = new Date(student.Tarih);
      const monthYear = `${date.getFullYear()}-${(
        "0" +
        (date.getMonth() + 1)
      ).slice(-2)}`;

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          month: monthYear,
          count: 0,
          courses: {},
        };
      }

      monthlyData[monthYear].count++;

      // Kurslara göre dağılım
      const courses = (student.Aldigi_Dersler || "").split(", ");
      courses.forEach((course) => {
        monthlyData[monthYear].courses[course] =
          (monthlyData[monthYear].courses[course] || 0) + 1;
      });
    });

    // Zaman sırasına göre sırala
    return Object.values(monthlyData).sort((a, b) =>
      a.month.localeCompare(b.month)
    );
  }, [filteredData]);

  // Universite ve bölüm ilişkisi
  const analyzeUniversityDepartmentRelation = useMemo(() => {
    const relation: Record<string, Record<string, number>> = {};

    filteredData.forEach((student) => {
      const uni = student.Universite;
      const dept = student.Bolum;

      if (!relation[uni]) {
        relation[uni] = {};
      }

      relation[uni][dept] = (relation[uni][dept] || 0) + 1;
    });

    // Treemap için veri formatı
    const treeData: {
      name: string;
      university: string;
      department: string;
      value: number;
    }[] = [];

    Object.entries(relation).forEach(([uni, depts]) => {
      Object.entries(depts).forEach(([dept, count]) => {
        treeData.push({
          name: `${uni} - ${dept}`,
          university: uni,
          department: dept,
          value: count,
        });
      });
    });

    return treeData.sort((a, b) => b.value - a.value).slice(0, 50); // Top 50 ilişki
  }, [filteredData]);

  // Özet istatistikler
  const summaryStats = useMemo(() => {
    const totalStudents = filteredData.length;
    const uniqueUniversities = new Set(filteredData.map((s) => s.Universite))
      .size;
    const uniqueDepartments = new Set(filteredData.map((s) => s.Bolum)).size;

    // Popüler kurslar
    const courseCount: Record<string, number> = {};
    filteredData.forEach((student) => {
      const courses = (student.Aldigi_Dersler || "").split(", ");
      courses.forEach((course) => {
        courseCount[course] = (courseCount[course] || 0) + 1;
      });
    });

    const topCourse = Object.entries(courseCount)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))[0] || {
      name: "Veri yok",
      count: 0,
    };

    // Eğitim durumu dağılımı
    const educationCount: Record<string, number> = {};
    filteredData.forEach((student) => {
      const status = student.Egitim_Durumu;
      educationCount[status] = (educationCount[status] || 0) + 1;
    });

    const topEducation = Object.entries(educationCount)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))[0] || {
      name: "Veri yok",
      count: 0,
    };

    // Aylık trend
    const monthlyTrend = analyzeTimeSeries;
    const currentMonth = monthlyTrend[monthlyTrend.length - 1]?.count || 0;
    const previousMonth = monthlyTrend[monthlyTrend.length - 2]?.count || 0;
    const trend = currentMonth - previousMonth;
    const trendPercent = previousMonth
      ? ((trend / previousMonth) * 100).toFixed(1)
      : 0;

    return {
      totalStudents,
      uniqueUniversities,
      uniqueDepartments,
      topCourse,
      topEducation,
      trend,
      trendPercent,
      currentMonth,
      previousMonth,
    };
  }, [filteredData, analyzeTimeSeries]);

  // Benzersiz üniversite ve eğitim durumu listeleri (filtreler için)
  const uniqueUniversities = useMemo(() => {
    return [...new Set(allData.map((s) => s.Universite))].sort();
  }, [allData]);

  const uniqueEducationStatus = useMemo(() => {
    return [...new Set(allData.map((s) => s.Egitim_Durumu))].sort();
  }, [allData]);

  const uniqueCourses = useMemo(() => {
    const allCourses = new Set();
    allData.forEach((student) => {
      const courses = (student.Aldigi_Dersler || "").split(", ");
      courses.forEach((course) => allCourses.add(course));
    });

    return [...allCourses].sort();
  }, [allData]);

  // Renk paleti
  const COLORS = [
    "#B80012",
    "#9E000F",
    "#7F000C",
    "#5E0009",
    "#450007",
    "#008C45",
    "#007A3D",
    "#006632",
    "#004E27",
    "#00381C",
  ];

  // Veri dışa aktarma fonksiyonu
  const exportData = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Ad,Soyad,Mail_Adresi,Telefon,Egitim_Durumu,Universite,Bolum,Sinif,Aldigi_Dersler,Tarih\n" +
      filteredData
        .map((row) => {
          return `"${row.Ad}","${row.Soyad}","${row.Mail_Adresi}","${row.Telefon}","${row.Egitim_Durumu}","${row.Universite}","${row.Bolum}","${row.Sinif}","${row.Aldigi_Dersler}","${row.Tarih}"`;
        })
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ogrenci_verileri.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Tarih aralığı formatı
  const formatDateRange = () => {
    if (dateRange.from && dateRange.to) {
      if (
        format(dateRange.from, "dd.MM.yyyy") ===
        format(dateRange.to, "dd.MM.yyyy")
      ) {
        return format(dateRange.from, "dd MMMM yyyy", { locale: tr });
      }
      return `${format(dateRange.from, "dd MMM yyyy", {
        locale: tr,
      })} - ${format(dateRange.to, "dd MMM yyyy", { locale: tr })}`;
    }
    return "Tüm tarihler";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary">
            Veri Analiz Panosu Yükleniyor
          </h2>
          <p className="text-muted-foreground mt-2">Veriler hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Öğrenci Veri Analiz Panosu
          </h1>
          <p className="text-muted-foreground">
            Toplam {allData.length.toLocaleString()} veri noktası ile kapsamlı
            analiz
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={exportData}
          >
            <Download className="h-4 w-4" />
            Veriyi Dışa Aktar
          </Button>

          <Button
            className="flex items-center gap-2 bg-primary hover:bg-primary-600"
            onClick={() => {
              setSearchTerm("");
              setEducationFilter("all");
              setUniversityFilter("all");
              setCourseFilter("all");
              setDateRange({ from: undefined, to: undefined });
              setCurrentPage(1);
            }}
          >
            <Filter className="h-4 w-4" />
            Filtreleri Sıfırla
          </Button>
        </div>
      </div>

      {/* Filtreler */}
      <Card className="mb-8 border-secondary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-secondary flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Veri Filtreleri
          </CardTitle>
          <CardDescription>
            Aşağıdaki filtreleri kullanarak veri setini daraltabilirsiniz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Arama</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ad, soyad, üniversite..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Eğitim Durumu</label>
              <Select
                value={educationFilter}
                onValueChange={setEducationFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tüm eğitim durumları" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm eğitim durumları</SelectItem>
                  {uniqueEducationStatus
                    .filter((status) => status !== "")
                    .map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Universite</label>
              <Select
                value={universityFilter}
                onValueChange={setUniversityFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tüm üniversiteler" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm üniversiteler</SelectItem>
                  {uniqueUniversities
                    .filter((uni) => uni !== "")
                    .map((uni) => (
                      <SelectItem key={uni} value={uni}>
                        {uni}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Alınan Ders</label>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tüm dersler" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm dersler</SelectItem>
                  {uniqueCourses
                    .filter(
                      (course): course is string =>
                        typeof course === "string" && course !== ""
                    )
                    .map((course) => (
                      <SelectItem key={course} value={course}>
                        {String(course)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Tarih Aralığı</label>
              <span className="text-xs text-muted-foreground">
                {filteredData.length.toLocaleString()} kayıt gösteriliyor
              </span>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full md:w-auto justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateRange()}
                    <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{
                      from: dateRange.from,
                      to: dateRange.to,
                    }}
                    onSelect={(range) =>
                      setDateRange({
                        from: range?.from,
                        to: range?.to,
                      })
                    }
                    locale={tr}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={setDateRangeToday}>
                  Bugün
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={setDateRangeYesterday}
                >
                  Dün
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={setDateRangeLast7Days}
                >
                  Son 7 Gün
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={setDateRangeLast30Days}
                >
                  Son 30 Gün
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={setDateRangeThisMonth}
                >
                  Bu Ay
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={setDateRangeLastMonth}
                >
                  Geçen Ay
                </Button>
                <Button variant="outline" size="sm" onClick={clearDateRange}>
                  Tümü
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Özet İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Toplam Öğrenci
                </p>
                <h3 className="text-2xl font-bold">
                  {summaryStats.totalStudents.toLocaleString()}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-xs text-muted-foreground">
                <span>
                  Toplam veri setinin{" "}
                  {((filteredData.length / allData.length) * 100).toFixed(1)}%'i
                </span>
              </div>
              <Progress
                value={(filteredData.length / allData.length) * 100}
                className="h-1 mt-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-secondary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  En Popüler Ders
                </p>
                <h3 className="text-lg font-bold line-clamp-1">
                  {summaryStats.topCourse.name}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-secondary" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-xs text-muted-foreground">
                <span>
                  {summaryStats.topCourse.count.toLocaleString()} öğrenci (
                  {(
                    (summaryStats.topCourse.count / filteredData.length) *
                    100
                  ).toFixed(1)}
                  %)
                </span>
              </div>
              <Progress
                value={
                  (summaryStats.topCourse.count / filteredData.length) * 100
                }
                className="h-1 mt-1 bg-muted"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Eğitim Durumu
                </p>
                <h3 className="text-lg font-bold line-clamp-1">
                  {summaryStats.topEducation.name}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-xs text-muted-foreground">
                <span>
                  {summaryStats.topEducation.count.toLocaleString()} öğrenci (
                  {(
                    (summaryStats.topEducation.count / filteredData.length) *
                    100
                  ).toFixed(1)}
                  %)
                </span>
              </div>
              <Progress
                value={
                  (summaryStats.topEducation.count / filteredData.length) * 100
                }
                className="h-1 mt-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-secondary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Aylık Trend
                </p>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold">
                    {summaryStats.trend >= 0 ? "+" : ""}
                    {summaryStats.trend}
                  </h3>
                  {summaryStats.trend > 0 ? (
                    <Badge className="bg-secondary text-secondary-foreground">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      {summaryStats.trendPercent}%
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                      {Math.abs(Number(summaryStats.trendPercent))}%
                    </Badge>
                  )}
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Önceki ay: {summaryStats.previousMonth}</span>
                <span>Şu anki ay: {summaryStats.currentMonth}</span>
              </div>
              <Progress
                value={50 + Number(summaryStats.trendPercent) * 0.5}
                className="h-1 mt-1 bg-muted"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ana İçerik */}
      <Tabs defaultValue="özet" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8">
          <TabsTrigger value="özet">Özet</TabsTrigger>
          <TabsTrigger value="eğitim">Eğitim Durumu</TabsTrigger>
          <TabsTrigger value="dersler">Alınan Dersler</TabsTrigger>
          <TabsTrigger value="üniversite">Üniversiteler</TabsTrigger>
          <TabsTrigger value="zaman">Zaman Analizi</TabsTrigger>
        </TabsList>

        {/* Özet Sekmesi */}
        <TabsContent value="özet">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-primary flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Eğitim Durumu Dağılımı
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 px-2 ${
                        chartType === "pie" ? "bg-muted" : ""
                      }`}
                      onClick={() => setChartType("pie")}
                    >
                      <PieChartIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 px-2 ${
                        chartType === "bar" ? "bg-muted" : ""
                      }`}
                      onClick={() => setChartType("bar")}
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Öğrencilerin eğitim durumlarına göre dağılımı
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {chartType === "pie" ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyzeEducationStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${percent}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {
                            //@ts-ignore
                            analyzeEducationStatus.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))
                          }
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value} öğrenci`, "Sayı"]}
                          labelFormatter={(name) => `${name}`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <ChartContainer
                      config={{
                        count: {
                          label: "Öğrenci Sayısı",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                    >
                      <BarChart
                        data={analyzeEducationStatus.map((item) => ({
                          name: item.name,
                          count: item.value,
                        }))}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 20,
                        }}
                      >
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="count"
                          fill="#B80012"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ChartContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-secondary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-secondary flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  En Popüler Dersler
                </CardTitle>
                <CardDescription>En çok tercih edilen dersler</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ChartContainer
                    config={{
                      count: {
                        label: "Öğrenci Sayısı",
                        color: "#008C45",
                      },
                    }}
                  >
                    <BarChart
                      data={analyzeCourses.map((item) => ({
                        name: item.name,
                        count: item.value,
                      }))}
                      layout="vertical"
                      margin={{
                        top: 5,
                        right: 30,
                        left: 150,
                        bottom: 5,
                      }}
                    >
                      <XAxis type="number" />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={150}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        fill="#008C45"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-primary flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5" />
                  Kayıt Trendi
                </CardTitle>
                <CardDescription>Aylara göre kayıt sayısı</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={analyzeTimeSeries}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#B80012"
                        fill="#B80012"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Eğitim Durumu Sekmesi */}
        <TabsContent value="eğitim">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Eğitim Durumu Dağılımı</CardTitle>
                <CardDescription>
                  Öğrencilerin eğitim durumlarına göre dağılımı
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyzeEducationStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${percent}%`}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {
                          //@ts-ignore
                          analyzeEducationStatus.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))
                        }
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} öğrenci`, "Sayı"]}
                        labelFormatter={(name) => `${name}`}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sinif Dağılımı</CardTitle>
                <CardDescription>
                  Öğrencilerin sınıflarına göre dağılımı
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyzeClasses}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${percent}%`}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {
                          //@ts-ignore
                          analyzeClasses.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))
                        }
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} öğrenci`, "Sayı"]}
                        labelFormatter={(name) => `${name}`}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="w-full">
              <CardHeader>
                <CardTitle>Eğitim Durumu ve Sinif İlişkisi</CardTitle>
                <CardDescription>
                  Eğitim durumuna göre sınıf dağılımı
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ChartContainer
                    config={{
                      "1.Sinif": {
                        label: "1.Sinif",
                        color: COLORS[0],
                      },
                      "2.Sinif": {
                        label: "2.Sinif",
                        color: COLORS[1],
                      },
                      "3.Sinif": {
                        label: "3.Sinif",
                        color: COLORS[2],
                      },
                      "4.Sinif": {
                        label: "4.Sinif",
                        color: COLORS[3],
                      },
                      Mezun: {
                        label: "Mezun",
                        color: COLORS[4],
                      },
                    }}
                  >
                    <BarChart
                      data={analyzeEducationStatus.map((edu) => {
                        const result: Record<string, any> = { name: edu.name };
                        analyzeClasses.forEach((cls) => {
                          const count = filteredData.filter(
                            (s) =>
                              s.Egitim_Durumu === edu.name &&
                              s.Sinif === cls.name
                          ).length;
                          result[cls.name] = count;
                        });
                        return result;
                      })}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {analyzeClasses.map((cls, index) => (
                        <Bar
                          key={cls.name}
                          dataKey={cls.name}
                          stackId="a"
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Dersler Sekmesi */}
        <TabsContent value="dersler">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>En Popüler Dersler</CardTitle>
                <CardDescription>En çok tercih edilen dersler</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[500px] w-full">
                  <ChartContainer
                    config={{
                      count: {
                        label: "Öğrenci Sayısı",
                        color: "#B80012",
                      },
                    }}
                  >
                    <BarChart
                      data={analyzeCourses.map((item) => ({
                        name: item.name,
                        count: item.value,
                      }))}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 150,
                      }}
                    >
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={150}
                        interval={0}
                      />
                      <YAxis />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="count"
                        fill="#B80012"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Eğitim Durumuna Göre Ders Tercihi</CardTitle>
                <CardDescription>
                  Eğitim durumuna göre en popüler dersler
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ChartContainer
                    config={{
                      count: {
                        label: "Öğrenci Sayısı",
                        color: "#008C45",
                      },
                    }}
                  >
                    <BarChart
                      data={uniqueEducationStatus.map((edu) => {
                        const result: Record<string, any> = { name: edu };
                        const eduStudents = filteredData.filter(
                          (s) => s.Egitim_Durumu === edu
                        );

                        // Her eğitim durumu için en popüler 3 ders
                        const courseCount: Record<string, number> = {};
                        eduStudents.forEach((student) => {
                          const courses = (student.Aldigi_Dersler || "").split(
                            ", "
                          );
                          courses.forEach((course) => {
                            courseCount[course] =
                              (courseCount[course] || 0) + 1;
                          });
                        });

                        const topCourses = Object.entries(courseCount)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 3);

                        topCourses.forEach(([course, count], index) => {
                          result[`Ders ${index + 1}`] = count;
                          result[`Ders ${index + 1} Adı`] = course;
                        });

                        return result;
                      })}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name, props) => {
                          const courseName = props.payload[`${name} Adı`];
                          return [`${value} öğrenci - ${courseName}`, name];
                        }}
                      />
                      <Legend />
                      <Bar dataKey="Ders 1" fill="#B80012" />
                      <Bar dataKey="Ders 2" fill="#7F000C" />
                      <Bar dataKey="Ders 3" fill="#450007" />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ders Kombinasyonları</CardTitle>
                <CardDescription>
                  En sık birlikte alınan dersler
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full overflow-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-4 text-left">
                          Ders Kombinasyonu
                        </th>
                        <th className="py-2 px-4 text-left">Öğrenci Sayısı</th>
                        <th className="py-2 px-4 text-left">Yüzde</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        // Ders kombinasyonlarını analiz et
                        const combinations: Record<string, number> = {};

                        filteredData.forEach((student) => {
                          const courses = (student.Aldigi_Dersler || "")
                            .split(", ")
                            .sort();

                          // İkili kombinasyonlar
                          for (let i = 0; i < courses.length; i++) {
                            for (let j = i + 1; j < courses.length; j++) {
                              const combo = `${courses[i]} + ${courses[j]}`;
                              combinations[combo] =
                                (combinations[combo] || 0) + 1;
                            }
                          }
                        });

                        // En popüler kombinasyonlar
                        return Object.entries(combinations)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 10)
                          .map(([combo, count], index) => (
                            <tr
                              key={index}
                              className="border-b hover:bg-muted/50"
                            >
                              <td className="py-2 px-4">{combo}</td>
                              <td className="py-2 px-4">{count}</td>
                              <td className="py-2 px-4">
                                {((count / filteredData.length) * 100).toFixed(
                                  1
                                )}
                                %
                              </td>
                            </tr>
                          ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Üniversiteler Sekmesi */}
        <TabsContent value="üniversite">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>En Popüler Üniversiteler</CardTitle>
                <CardDescription>
                  En çok öğrenciye sahip üniversiteler
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ChartContainer
                    config={{
                      count: {
                        label: "Öğrenci Sayısı",
                        color: "#B80012",
                      },
                    }}
                  >
                    <BarChart
                      data={analyzeUniversities.map((item) => ({
                        name: item.name,
                        count: item.value,
                      }))}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 150,
                      }}
                    >
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={150}
                        interval={0}
                      />
                      <YAxis />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="count"
                        fill="#B80012"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>En Popüler Bölümler</CardTitle>
                <CardDescription>
                  En çok öğrenciye sahip bölümler
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ChartContainer
                    config={{
                      count: {
                        label: "Öğrenci Sayısı",
                        color: "#008C45",
                      },
                    }}
                  >
                    <BarChart
                      data={analyzeDepartments.map((item) => ({
                        name: item.name,
                        count: item.value,
                      }))}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 150,
                      }}
                    >
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={150}
                        interval={0}
                      />
                      <YAxis />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="count"
                        fill="#008C45"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Universite-Bolum İlişkisi</CardTitle>
                <CardDescription>
                  Üniversitelere göre bölüm dağılımı
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[500px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                      data={analyzeUniversityDepartmentRelation}
                      dataKey="value"
                      aspectRatio={4 / 3}
                      stroke="#fff"
                      fill="#8884d8"
                    >
                      <Tooltip
                        formatter={
                          //@ts-ignore
                          (value, name, props) => [
                            `${value} öğrenci`,
                            `${props.payload.university} - ${props.payload.department}`,
                          ]
                        }
                      />
                      {analyzeUniversityDepartmentRelation.map(
                        
                        (entry, index) => (
                          <Cell
                            key={`cell-${index} - ${entry.university}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        )
                      )}
                    </Treemap>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Zaman Analizi Sekmesi */}
        <TabsContent value="zaman">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Kayıt Trendi</CardTitle>
                <CardDescription>Aylara göre kayıt sayısı</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={analyzeTimeSeries}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="Kayıt Sayısı"
                        stroke="#B80012"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ders Popülerliği Trendi</CardTitle>
                <CardDescription>
                  Zaman içinde derslerin popülerliği
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={analyzeTimeSeries.map((month) => {
                        const result: {
                          month: string;
                          [key: string]: number | string;
                        } = { month: month.month };

                        // En popüler 5 dersi bul
                        const topCourses = analyzeCourses
                          .slice(0, 5)
                          .map((c) => c.name);

                        topCourses.forEach((course) => {
                          result[course] = month.courses[course] || 0;
                        });

                        return result;
                      })}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {analyzeCourses.slice(0, 5).map((course, index) => (
                        <Line
                          key={course.name}
                          type="monotone"
                          dataKey={course.name}
                          stroke={COLORS[index % COLORS.length]}
                          activeDot={{ r: 8 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Öğrenci Listesi */}
      <PremiumDataTable data={filteredData} dateIsShown={false} />
    </div>
  );
}
