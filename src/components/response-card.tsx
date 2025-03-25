"use client";

import { CheckCircle2, FileChartColumn, ScanEye, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer";
import HRResponseDrawer from "./response-drawer";

interface ResponseCardProps {
  apiResponse: {
    fit_for_position: number;
    recommendation: string;
  };

  blobCvUrl: string;
}

export default function ResponseCard({
  apiResponse,
  blobCvUrl,
}: ResponseCardProps) {
  return (
    <Card className="border border-border/50">
      <div className="flex justify-around p-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.open(blobCvUrl, "_blank")}
          className="hover:text-green-500 transition-colors"
        >
          <ScanEye className="h-5 w-5" />
        </Button>

        <ResponseFullScreenCard
          openButton={
            <Button
              variant="ghost"
              size="icon"
              className="hover:text-orange-500 transition-colors"
            >
              <FileChartColumn className="h-5 w-5" />
            </Button>
          }
        />
      </div>
      <hr className="border-t border-border/50" />
      <CardContent className="p-4 grid gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span className="font-medium">Pozisyona Uyumluluk</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{apiResponse.fit_for_position}%</span>
          </div>
        </div>

        <Progress value={apiResponse.fit_for_position} className="h-2" />

        <p className="text-sm text-muted-foreground line-clamp-2">
          {apiResponse.recommendation}
        </p>
      </CardContent>
    </Card>
  );
}

function ResponseFullScreenCard({
  openButton,
}: {
  openButton?: React.ReactNode;
}) {
  return (
    <>
      <Drawer>
        {openButton ? (
          <>
            <DrawerTrigger>{openButton}</DrawerTrigger>
          </>
        ) : (
          <>
            <DrawerTrigger>Open</DrawerTrigger>
          </>
        )}
        <DrawerContent className="overflow-y-auto">
          <DrawerHeader>
            <DrawerClose className="ml-auto">
              <X size={24} />
            </DrawerClose>
          </DrawerHeader>

          <HRResponseDrawer />
        </DrawerContent>
      </Drawer>
    </>
  );
}
