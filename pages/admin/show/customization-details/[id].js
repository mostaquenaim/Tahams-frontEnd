import { useRouter } from 'next/router';
import {
  FiArrowLeft,
  FiCheck,
  FiClock,
  FiEdit3,
  FiPhone,
  FiSend,
  FiX,
} from 'react-icons/fi';
import useCustomizationReq from '../../../../Hooks/useCustomizationReq';
import {
  AdminPage,
  Badge,
  Button,
  DetailItem,
  DetailList,
  EmptyState,
  PageHeader,
  Section,
  Thumb,
} from '../../../../components/Admin';

const STATUS_TONES = { approved: 'success', rejected: 'danger' };

const imageUrl = (filename) =>
  `${process.env.NEXT_PUBLIC_API}/admin/getimage/${filename}`;

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString();
};

const TIMELINE_TONES = {
  neutral: 'bg-gray-100 text-gray-600',
  info: 'bg-sky-50 text-sky-600',
  success: 'bg-emerald-50 text-emerald-600',
  danger: 'bg-red-50 text-red-600',
};

function TimelineItem({ icon, tone = 'neutral', title, time, note, noteLabel }) {
  return (
    <li className="flex gap-3">
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full [&_svg]:h-4 [&_svg]:w-4 ${TIMELINE_TONES[tone]}`}
      >
        {icon}
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{time}</p>
        {note && (
          <p className="mt-1.5 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
            <span className="font-medium">{noteLabel}:</span> {note}
          </p>
        )}
      </div>
    </li>
  );
}

const CustomizationDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const { isReady } = router;

  const [customizations, , isFetching] = useCustomizationReq(id, isReady);
  const isPending = !isReady || isFetching;

  const backButton = (
    <Button
      href="/admin/show/show-customization-requests"
      variant="ghost"
      size="sm"
      icon={<FiArrowLeft />}
      className="-ml-2"
    >
      All requests
    </Button>
  );

  if (isPending) {
    return (
      <AdminPage title="Customization request" width="narrow">
        <PageHeader eyebrow={backButton} title="Customization request" />
        <div className="grid gap-5 lg:grid-cols-3" aria-busy="true">
          <div className="h-72 animate-pulse rounded-xl border border-gray-200 bg-gray-50" />
          <div className="h-72 animate-pulse rounded-xl border border-gray-200 bg-gray-50 lg:col-span-2" />
        </div>
      </AdminPage>
    );
  }

  if (!Array.isArray(customizations) || customizations.length === 0) {
    return (
      <AdminPage title="Customization request" width="narrow">
        <PageHeader eyebrow={backButton} title="Customization request" />
        <Section bodyClassName="p-0">
          <EmptyState
            icon={<FiEdit3 />}
            title="Request not found"
            description="This customization request doesn't exist or was deleted."
          />
        </Section>
      </AdminPage>
    );
  }

  const main = customizations[0];
  const status = String(main.status || 'draft').toLowerCase();
  const sides = customizations.map((item) => item.side).filter(Boolean);
  const hasInstructions =
    main.specialInstructions && main.specialInstructions !== '0';
  const requestLabel = main.groupId
    ? `#${String(main.groupId).slice(-8)}`
    : `#${main.id}`;

  return (
    <AdminPage title={`Customization ${requestLabel}`} width="narrow">
      <PageHeader
        eyebrow={backButton}
        title={`Customization request ${requestLabel}`}
        badge={
          <Badge tone={STATUS_TONES[status] || 'warning'} dot>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        }
        description={`Submitted ${formatDateTime(main.submittedAt)}`}
        actions={
          main.phone && (
            <Button href={`tel:${main.phone}`} icon={<FiPhone />}>
              Call customer
            </Button>
          )
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-1">
          <Section title="Customer">
            <DetailList>
              <DetailItem label="Name">{main.name || '-'}</DetailItem>
              <DetailItem label="Phone">{main.phone || '-'}</DetailItem>
              <DetailItem label="Address" stacked>
                {main.address || '-'}
              </DetailItem>
              {main.user && (
                <DetailItem label="Account">
                  {main.user.name || main.user.email || '-'}
                </DetailItem>
              )}
            </DetailList>
          </Section>

          <Section title="Order details">
            <DetailList>
              <DetailItem label="Quantity">{main.quantity ?? '-'}</DetailItem>
              <DetailItem label="Size">
                {main.size || 'Not specified'}
              </DetailItem>
              <DetailItem label="Color">{main.color || '-'}</DetailItem>
              <DetailItem label="Printing method">
                {main.printingMethod || 'Not specified'}
              </DetailItem>
              <DetailItem label="Sides">
                {sides.length ? sides.join(', ') : '-'}
              </DetailItem>
            </DetailList>
          </Section>

          {hasInstructions && (
            <Section title="Special instructions">
              <p className="whitespace-pre-line text-sm text-gray-700">
                {main.specialInstructions}
              </p>
            </Section>
          )}
        </div>

        <div className="space-y-5 lg:col-span-2">
          {customizations.map((customization) => {
            const texts = customization.customTexts || [];
            const images = customization.customImages || [];

            return (
              <Section
                key={customization.id}
                title={`${
                  customization.side
                    ? customization.side.charAt(0).toUpperCase() +
                      customization.side.slice(1)
                    : 'Design'
                } side`}
                actions={
                  <span className="pr-1 text-xs text-gray-500">
                    ID {customization.id} · Qty {customization.quantity ?? '-'}
                  </span>
                }
              >
                <div className="mx-auto max-w-sm">
                  <Thumb
                    src={
                      customization.previewImage
                        ? imageUrl(customization.previewImage)
                        : null
                    }
                    alt={`${customization.color || ''} t-shirt ${
                      customization.side || ''
                    } design`}
                    fit="contain"
                    className="h-auto max-h-[28rem] min-h-[10rem] w-full bg-gray-50"
                  />
                </div>

                {texts.length > 0 && (
                  <div className="mt-6">
                    <h3 className="mb-3 text-sm font-semibold text-gray-900">
                      Custom text
                    </h3>
                    <ul className="space-y-3">
                      {texts.map((text) => {
                        const isLight = /^#f{3}(f{3})?$/i.test(text.color || '');
                        return (
                          <li
                            key={text.id}
                            className="rounded-lg border border-gray-200 p-3"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <p
                                  className={`inline-block max-w-full break-words rounded-md px-3 py-1.5 ${
                                    isLight
                                      ? 'bg-gray-900'
                                      : 'border border-gray-200 bg-white'
                                  }`}
                                  style={{
                                    fontFamily: text.fontFamily,
                                    fontSize: `${Math.min(
                                      Number(text.fontSize) || 16,
                                      20,
                                    )}px`,
                                    fontWeight: text.fontWeight,
                                    color: text.color,
                                  }}
                                >
                                  {text.content}
                                </p>
                                <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-500">
                                  <div>Font: {text.fontFamily || '-'}</div>
                                  <div>Size: {text.fontSize}px</div>
                                  <div>Weight: {text.fontWeight}</div>
                                  <div>Rotation: {text.rotation || 0}°</div>
                                  <div className="flex items-center gap-1.5">
                                    Color:
                                    <span
                                      className="inline-block h-3.5 w-3.5 rounded-full border border-gray-300"
                                      style={{ backgroundColor: text.color }}
                                    />
                                    {text.color}
                                  </div>
                                </dl>
                              </div>
                              <div className="shrink-0 text-xs text-gray-500">
                                <p>
                                  Position: ({text.x}, {text.y})
                                </p>
                                <p>
                                  Size: {text.width}×{text.height}px
                                </p>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {images.length > 0 && (
                  <div className="mt-6">
                    <h3 className="mb-3 text-sm font-semibold text-gray-900">
                      Custom images
                    </h3>
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {images.map((image) => (
                        <li
                          key={image.id}
                          className="overflow-hidden rounded-lg border border-gray-200"
                        >
                          <a
                            href={imageUrl(image.filename)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-gray-50 p-3"
                            title="Open full size"
                          >
                            <Thumb
                              src={imageUrl(image.filename)}
                              alt="Custom design"
                              fit="contain"
                              className="h-32 w-full bg-white"
                            />
                          </a>
                          <div className="border-t border-gray-200 px-3 py-2 text-xs text-gray-500">
                            <p className="truncate font-medium text-gray-900">
                              {image.filename}
                            </p>
                            <p className="mt-1">
                              Original {image.originalWidth}×
                              {image.originalHeight}px · Display {image.width}×
                              {image.height}px
                            </p>
                            <p>
                              Position ({image.x}, {image.y})
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {texts.length === 0 && images.length === 0 && (
                  <p className="mt-4 text-center text-sm text-gray-500">
                    No custom text or images on this side.
                  </p>
                )}
              </Section>
            );
          })}

          <Section title="Status history">
            <ol className="space-y-4">
              <TimelineItem
                icon={<FiSend />}
                tone="info"
                title="Request submitted"
                time={formatDateTime(main.submittedAt)}
              />
              {main.reviewedAt && (
                <TimelineItem
                  icon={<FiClock />}
                  title="Reviewed by team"
                  time={formatDateTime(main.reviewedAt)}
                  note={main.reviewerNote}
                  noteLabel="Note"
                />
              )}
              {main.approvedAt && (
                <TimelineItem
                  icon={<FiCheck />}
                  tone="success"
                  title="Approved"
                  time={formatDateTime(main.approvedAt)}
                />
              )}
              {main.rejectedAt && (
                <TimelineItem
                  icon={<FiX />}
                  tone="danger"
                  title="Rejected"
                  time={formatDateTime(main.rejectedAt)}
                  note={main.rejectionReason}
                  noteLabel="Reason"
                />
              )}
            </ol>
          </Section>
        </div>
      </div>
    </AdminPage>
  );
};

export default CustomizationDetails;
