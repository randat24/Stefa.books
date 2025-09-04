"use client";

import { BookOpen, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-slate-400" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">
            Сторінка не знайдена
          </h1>
          <p className="text-slate-600">
            На жаль, сторінка, яку ви шукаєте, не існує або була переміщена.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg">
            <Link href="/books">
              <BookOpen size={16} className="mr-2" />
              Каталог книг
            </Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/">
              <Home size={16} className="mr-2" />
              На головну
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}