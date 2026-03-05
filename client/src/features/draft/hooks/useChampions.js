import { useEffect } from 'react';
import useDraftStore from '../stores/draftStore';
import { fetchChampions } from '../services/champions.services';

const useChampions = () => {
  const { champions, championsLoaded, setChampions } = useDraftStore();

  useEffect(() => {
    if (championsLoaded) return;

    const load = async () => {
      try {
        const { champions: data, version } = await fetchChampions();
        // Sort alphabetically
        const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
        setChampions(sorted, version);
      } catch (error) {
        console.error('Failed to load champions:', error);
      }
    };

    load();
  }, [championsLoaded, setChampions]);

  return { champions, championsLoaded };
};

export default useChampions;
