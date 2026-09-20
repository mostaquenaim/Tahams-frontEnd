import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiSquare } from 'react-icons/fi';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import {
  AdminPage,
  Badge,
  Button,
  EmptyState,
  Modal,
  PageHeader,
  Section,
  Thumb,
  cx,
  getErrorMessage,
} from '../../../components/Admin';

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
};

const UpdatePopUp = () => {
  const axiosPublic = useAxiosPublic();
  const axiosSecure = useAxiosSecure();

  const [popUps, setPopUps] = useState([]);
  const [isPending, setIsPending] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadPopUps = useCallback(async () => {
    try {
      const result = await axiosPublic.get('/admin/view-all-pop-up');
      const list = Array.isArray(result.data) ? result.data : [];
      setPopUps(list);
      setSelectedId(list.find((popUp) => popUp.isActive)?.id ?? null);
      setLoadError('');
    } catch (err) {
      console.error('Error loading pop-ups:', err);
      setLoadError(getErrorMessage(err, 'Could not load pop-ups.'));
    } finally {
      setIsPending(false);
    }
  }, [axiosPublic]);

  useEffect(() => {
    loadPopUps();
  }, [loadPopUps]);

  const activeId = popUps.find((popUp) => popUp.isActive)?.id ?? null;
  const selected = popUps.find((popUp) => popUp.id === selectedId);
  const hasChange = selectedId !== null && selectedId !== activeId;

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await axiosSecure.put(`/admin/update-active-pop-up/${selectedId}`, {});
      toast.success('Active pop-up updated');
      setConfirmOpen(false);
      await loadPopUps();
    } catch (err) {
      console.error('Error updating active pop-up:', err);
      toast.error(getErrorMessage(err, 'Could not update the active pop-up.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPage title="Update pop-up" width="form">
      <PageHeader
        title="Update pop-up"
        description="Choose which pop-up is shown on the storefront."
        actions={
          <Button href="/admin/add/add-new-pop-up" icon={<FiPlus />}>
            Add pop-up
          </Button>
        }
      />

      <Section
        title="Pop-ups"
        bodyClassName="p-0"
        actions={
          popUps.length > 0 && (
            <span className="pr-1 text-xs text-gray-500">
              {popUps.length} total
            </span>
          )
        }
      >
        {isPending ? (
          <ul className="divide-y divide-gray-100" aria-busy="true">
            {Array.from({ length: 3 }, (_, index) => (
              <li key={index} className="flex items-center gap-4 p-4">
                <div className="h-12 w-12 animate-pulse rounded-lg bg-gray-100" />
                <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
              </li>
            ))}
          </ul>
        ) : loadError ? (
          <EmptyState
            icon={<FiSquare />}
            title="Could not load pop-ups"
            description={loadError}
            action={
              <Button
                onClick={() => {
                  setIsPending(true);
                  loadPopUps();
                }}
              >
                Try again
              </Button>
            }
          />
        ) : popUps.length === 0 ? (
          <EmptyState
            icon={<FiSquare />}
            title="No pop-ups yet"
            description="Create a pop-up first, then pick which one is active here."
            action={
              <Button href="/admin/add/add-new-pop-up" variant="primary">
                Add pop-up
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-gray-100" role="radiogroup">
            {popUps.map((popUp) => {
              const isSelected = selectedId === popUp.id;

              return (
                <li key={popUp.id}>
                  <label
                    className={cx(
                      'flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors',
                      isSelected ? 'bg-gray-50' : 'hover:bg-gray-50/60',
                    )}
                  >
                    <input
                      type="radio"
                      name="activePopUp"
                      checked={isSelected}
                      onChange={() => setSelectedId(popUp.id)}
                      className="h-4 w-4 shrink-0 cursor-pointer accent-gray-900"
                    />
                    <Thumb
                      src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${popUp.filename}`}
                      alt={popUp.title}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-medium text-gray-900">
                          {popUp.title}
                        </span>
                        {popUp.isActive && (
                          <Badge tone="success" dot>
                            Currently active
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {formatDate(popUp.startDate)} –{' '}
                        {formatDate(popUp.endDate)}
                      </p>
                      {popUp.url && (
                        <a
                          href={popUp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="mt-0.5 block max-w-full truncate text-xs text-sky-700 hover:underline"
                        >
                          {popUp.url}
                        </a>
                      )}
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {popUps.length > 0 && (
        <div className="mt-4 flex justify-end">
          <Button
            variant="primary"
            disabled={!hasChange}
            onClick={() => setConfirmOpen(true)}
          >
            Save changes
          </Button>
        </div>
      )}

      <Modal
        open={confirmOpen}
        onClose={() => !saving && setConfirmOpen(false)}
        title="Change active pop-up?"
        description={
          selected
            ? `"${selected.title}" will replace the current pop-up on the storefront.`
            : undefined
        }
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button variant="primary" loading={saving} onClick={handleConfirm}>
              Confirm
            </Button>
          </>
        }
      />
    </AdminPage>
  );
};

export default UpdatePopUp;
