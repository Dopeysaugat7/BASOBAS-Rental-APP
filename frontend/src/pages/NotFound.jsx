import { Button } from "@/components/ui/button";
import React from "react";

const ErrorPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full font-sans p-4">
      <div className="mt-[18rem] flex flex-col items-center justify-center">
        <h1 className="text-6xl font-bold text-red-600 mb-2">ERROR</h1>
        <h2 className="text-9xl font-bold text-gray-800 mb-4">404</h2>
        <p className="text-xl text-gray-600 mb-6">
          We can’t seem to find the page you are looking for!
        </p>
        <Button variant="outline" size={"lg"} className={"py-6 px-10 text-lg"}>
          <a href="/">Back to Home Page</a>
        </Button>
      </div>
      <footer className="absolute bottom-4 text-gray-600 text-lg font-semibold">
        <p>© 2025 - Basobas</p>
      </footer>
    </div>
  );
};

export default ErrorPage;
