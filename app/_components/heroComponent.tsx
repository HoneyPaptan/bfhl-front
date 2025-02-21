
"use client";


import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import Select from "react-select";

interface Option {
  label: string;
  value: string;
}

interface ResponseData {
  alphabets?: string[];
  numbers?: string[];
  highest_alphabet?: string[];
}

const options: Option[] = [
  { label: "Alphabets", value: "alphabets" },
  { label: "Numbers", value: "numbers" },
  { label: "Highest Alphabet", value: "highest_alphabet" }
];

export default function Home() {
  const [jsonInput, setJsonInput] = useState<string>("");
  const [responseData, setResponseData] = useState<ResponseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const parsedData = JSON.parse(jsonInput);
      if (
        !parsedData.data ||
        !Array.isArray(parsedData.data) ||
        !parsedData.data.every((item: string | number) => typeof item === "string" || typeof item === "number")
      ) {
        throw new Error("Invalid format: JSON should contain a 'data' key with an array of strings or numbers.");
      }
      
      parsedData.data = parsedData.data.map((item: string | number) => item.toString());
      
      const res = await axios.post("https://bfhl-api-qwo8.onrender.com/bfhl", parsedData, {
        headers: { "Content-Type": "application/json" },
      });
      setResponseData(res.data);
    }catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || err.message || "Invalid JSON format or API error");
      } else {
        setError("An unknown error occurred");
    }} finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">BFHL Challenge</h1>
      <Textarea
        className="w-full max-w-lg"
        rows={5}
        placeholder='{"data": ["A", "C", "z"]}'
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
      />
      <Button className="mt-2" onClick={handleSubmit} disabled={loading}>
        {loading ? "Loading..." : "Submit"}
      </Button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {responseData && (
        <Card className="mt-4 w-full max-w-lg">
          <CardContent>
            <label>Select Data to Display:</label>
            <Select
              isMulti
              options={options}
              value={options.filter(option => selectedOptions.includes(option.value))}
              onChange={(selected) => setSelectedOptions(selected.map(s => s.value))}
              className="mt-2"
            />
            <div className="mt-2">
              {selectedOptions.includes("alphabets") && responseData.alphabets && (
                <p>Alphabets: {responseData.alphabets.join(", ")}</p>
              )}
              {selectedOptions.includes("numbers") && responseData.numbers && (
                <p>Numbers: {responseData.numbers.join(", ")}</p>
              )}
              {selectedOptions.includes("highest_alphabet") && responseData.highest_alphabet && (
                <p>Highest Alphabet: {responseData.highest_alphabet.join(", ")}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      <div className="flex items-center justify-center">
        <small className="text-center tracking-tighter text-xs font-bold text-black/35 w-1/2 mt-10">
          The backend of this application is hosted on Render which is on free trial. So the API Request might take around 40seconds to give the response. Please be Patient :)
        </small>
      </div>
    </div>
  );
}
