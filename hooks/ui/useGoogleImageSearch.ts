import { useState } from "react";

const API_KEY = "AIzaSyDPbsh2cXsQZY8IQgSfKYj3Be1Zeg4i8DQ";
const CX = "d189de1b204794ec5";

const useGoogleImageSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPhotos = async (description: String) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&q=${description}&searchType=image`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      return data.items[0].link;
    } catch (err: any) {
      setError(err);
      setLoading(false);
    }
  };

  return { loading, setLoading, error, fetchPhotos };
};

export default useGoogleImageSearch;
