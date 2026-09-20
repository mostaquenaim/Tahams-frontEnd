import { useEffect, useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import toast from 'react-hot-toast';
import { FiMenu, FiSave } from 'react-icons/fi';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import useLoadCats from '../../../Hooks/useLoadCats';
import {
  AdminPage,
  Badge,
  Button,
  EmptyState,
  PageHeader,
  Section,
  cx,
  getErrorMessage,
} from '../../../components/Admin';

const getAudience = (category) => {
  if (!category?.isGenderVaried) return null;
  if (category.isForWomen) return 'Women';
  if (category.isForMen) return 'Men';
  return null;
};

const RearrangeNavbar = () => {
  const axiosSecure = useAxiosSecure();
  const [categories, refetch, isPending] = useLoadCats();
  const [orderedIds, setOrderedIds] = useState([]);
  const [saving, setSaving] = useState(false);

  // Start from the server order whenever it (re)loads.
  // (Skipped while pending: the hook's `[]` default is a new array each render.)
  useEffect(() => {
    if (isPending) return;
    setOrderedIds(categories.map((category) => category.id));
  }, [categories, isPending]);

  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const isDirty =
    orderedIds.length === categories.length &&
    orderedIds.some((id, index) => id !== categories[index]?.id);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;

    setOrderedIds((current) => {
      const next = [...current];
      const [moved] = next.splice(result.source.index, 1);
      next.splice(result.destination.index, 0, moved);
      return next;
    });
  };

  const handleReset = () => setOrderedIds(categories.map((c) => c.id));

  const handleSave = async () => {
    setSaving(true);
    try {
      await axiosSecure.post(
        '/admin/shuffle-category',
        orderedIds.map((id, index) => ({ id, serial: index + 1 })),
      );
      toast.success('Navbar order saved');
      await refetch();
    } catch (err) {
      console.error('Failed to save category order:', err);
      toast.error(getErrorMessage(err, 'Could not save the navbar order.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPage title="Rearrange navbar" width="form">
      <PageHeader
        title="Rearrange navbar"
        description="Drag series into the order they should appear in the storefront navigation."
        actions={
          <>
            {isDirty && (
              <Button variant="ghost" onClick={handleReset} disabled={saving}>
                Reset
              </Button>
            )}
            <Button
              variant="primary"
              icon={<FiSave />}
              loading={saving}
              disabled={!isDirty}
              onClick={handleSave}
            >
              Save order
            </Button>
          </>
        }
      />

      <Section
        title="Navigation order"
        actions={isDirty && <Badge tone="warning">Unsaved changes</Badge>}
        bodyClassName="p-2"
      >
        {isPending ? (
          <ul className="space-y-1.5 p-1" aria-busy="true">
            {Array.from({ length: 6 }, (_, index) => (
              <li
                key={index}
                className="h-11 animate-pulse rounded-lg bg-gray-100"
              />
            ))}
          </ul>
        ) : orderedIds.length === 0 ? (
          <EmptyState
            icon={<FiMenu />}
            title="No series found"
            description="Add a series and it will show up here."
            action={
              <Button href="/admin/add/add-series" variant="secondary">
                Add series
              </Button>
            }
          />
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="categories">
              {(provided) => (
                <ul
                  className="space-y-1.5 p-1"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {orderedIds.map((id, index) => {
                    const category = categoriesById.get(id);
                    const audience = getAudience(category);

                    return (
                      <Draggable
                        key={`category-${id}`}
                        draggableId={`category-${id}`}
                        index={index}
                      >
                        {(dragProvided, snapshot) => (
                          <li
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className={cx(
                              'flex select-none items-center gap-3 rounded-lg border bg-white px-3 py-2.5 text-sm transition-shadow',
                              snapshot.isDragging
                                ? 'border-gray-300 shadow-lg'
                                : 'border-gray-200 hover:border-gray-300',
                            )}
                          >
                            <FiMenu className="h-4 w-4 shrink-0 text-gray-400" />
                            <span className="w-6 shrink-0 text-xs tabular-nums text-gray-400">
                              {index + 1}
                            </span>
                            <span className="min-w-0 flex-1 truncate font-medium text-gray-900">
                              {category?.name || 'Unnamed'}
                            </span>
                            {audience && <Badge tone="info">{audience}</Badge>}
                          </li>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </Section>
    </AdminPage>
  );
};

export default RearrangeNavbar;
