import { useEffect, useState } from "react";
import { getAllStates } from "../Services/StatesApi";
import { getAllCities } from "../Services/CitiesApi";

export default function useLocationOptions(selectedStateName) {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [statesLoading, setStatesLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(false);

  useEffect(() => {
    let active = true;
    getAllStates({ page: 1, rowsPerPage: 1000 })
      .then((result) => {
        if (active) setStates(result?.data || []);
      })
      .catch(() => {
        if (active) setStates([]);
      })
      .finally(() => {
        if (active) setStatesLoading(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const selectedState = states.find((state) => state.name === selectedStateName);
    if (!selectedState) {
      setCities([]);
      return () => { active = false; };
    }

    setCitiesLoading(true);
    getAllCities({ page: 1, rowsPerPage: 1000, state: selectedState._id })
      .then((result) => {
        if (active) setCities(result?.data || []);
      })
      .catch(() => {
        if (active) setCities([]);
      })
      .finally(() => {
        if (active) setCitiesLoading(false);
      });
    return () => { active = false; };
  }, [selectedStateName, states]);

  return { states, cities, statesLoading, citiesLoading };
}
