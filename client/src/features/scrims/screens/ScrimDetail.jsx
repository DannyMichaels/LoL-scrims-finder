import { useEffect } from 'react';
import useScrimStore from '@/features/scrims/stores/scrimStore';
import { useParams, useHistory } from 'react-router-dom';
import ScrimSection from '@/features/scrims/components/ScrimSection';
import Navbar from '@/components/shared/Navbar/Navbar';
import { Helmet } from 'react-helmet';
import Loading from '@/components/shared/Loading';
import { PageContent } from '@/components/shared/PageComponents';
import useAlerts from '@/hooks/useAlerts';

export default function ScrimDetail() {
  const { id } = useParams();
  const { scrims, fetchScrim } = useScrimStore();
  const history = useHistory();
  const { setCurrentAlert } = useAlerts();

  // Get scrim from store (updated via sockets)
  const scrim = scrims.find((s) => s._id === id);

  // Fetch scrim if not in store
  useEffect(() => {
    const loadScrim = async () => {
      if (!scrim) {
        try {
          const fetchedScrim = await fetchScrim(id); // fetchScrim also adds it to the scrims array, which helps the .find() above find the scrim for us
          if (!fetchedScrim) {
            setCurrentAlert({
              type: 'Error',
              message: 'Scrim not found!, redirecting to home',
            });
            history.push('/scrims');
          }
        } catch (error) {
          console.log({ error });
          setCurrentAlert({
            type: 'Error',
            message: 'Error finding scrim, redirecting to home',
          });
          history.push('/scrims');
        }
      }
    };

    loadScrim();
  }, [id, scrim, fetchScrim, history, setCurrentAlert]);

  // Check if scrim was deleted from store
  useEffect(() => {
    if (scrims.length > 0 && !scrim && id) {
      // Scrim was deleted - redirect silently
      history.push('/scrims');
    }
  }, [scrims, scrim, id, history]);

  if (!scrim) return <Loading text="Loading Scrim Data" />;

  return (
    <div>
      <Helmet>
        <meta charSet="utf-8" />
        <title>
          {scrim?.title ?? `${scrim.createdBy.name}'s Scrim`} | Reluminate.gg
        </title>
        <meta
          name="description"
          content={`Visit ${
            scrim?.title ?? 'this scrim'
          } at Reluminate.gg - Lighting up the rift!`}
        />
      </Helmet>

      <Navbar showLess />
      <PageContent>
        <div className={`scrim__container ${scrim?._id}`}>
          <ScrimSection scrimData={scrim} isInDetail />
        </div>
      </PageContent>
    </div>
  );
}
