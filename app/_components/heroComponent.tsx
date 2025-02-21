// Frontend: Next.js (App Router) with ShadCN and react-select
"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import Select from "react-select";

const options = [
  { label: "Alphabets", value: "alphabets" },
  { label: "Numbers", value: "numbers" },
  { label: "Highest Alphabet", value: "highest_alphabet" }
];

export default function Home() {
  const [jsonInput, setJsonInput] = useState("");
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const parsedData = JSON.parse(jsonInput);
      if (
        !parsedData.data ||
        !Array.isArray(parsedData.data) ||
        !parsedData.data.every(item => typeof item === "string" || typeof item === "number")
      ) {
        throw new Error("Invalid format: JSON should contain a 'data' key with an array of strings or numbers.");
      }
      
      // Convert numbers to strings to match API expectations
      parsedData.data = parsedData.data.map(item => item.toString());
      
      const res = await axios.post("https://bfhl-api-qwo8.onrender.com/bfhl", parsedData, {
        headers: { "Content-Type": "application/json" },
      });
      setResponseData(res.data);
    } catch (err) {
      console.error("API Error:", err.response?.data || err.message);
      setError(err.response?.data?.detail || err.message || "Invalid JSON format or API error");
    } finally {
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
    </div>
  );
}
