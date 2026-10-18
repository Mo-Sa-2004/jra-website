import { notFound } from "next/navigation";
import { SubmitButton } from "@/components/admin/form-controls";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { updateRestaurant } from "@/lib/actions/admin";
import { RestaurantPhotoManager } from "@/components/admin/restaurant-photos";
import { DeleteRestaurantButton } from "@/components/admin/delete-restaurant-button";
import { cx, ui } from "@/lib/ui";

export default async function AdminEditRestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const restaurant = await db.restaurant.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  if (!restaurant) notFound();

  const ta = await getTranslations("admin.common");
  const tr = await getTranslations("admin.restaurants");
  const tStatus = await getTranslations("admin.restaurants.statusOptions");

  const action = updateRestaurant.bind(null, id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className={ui.sectionTitle}>{tr("editRestaurant")}</h1>
        <DeleteRestaurantButton id={restaurant.id} name={restaurant.name} redirectToList />
      </div>

      <section className={cx("mt-6 max-w-2xl", ui.panel)}>
        <h2 className="font-display text-base font-semibold text-ink">{tr("photos")}</h2>
        <div className="mt-4">
          <RestaurantPhotoManager restaurantId={restaurant.id} images={restaurant.images} />
        </div>
      </section>

      <form action={action} className="mt-6 max-w-xl space-y-4">
        <div>
          <label className={ui.fieldLabel}>{ta("name")}</label>
          <input
            name="name"
            defaultValue={restaurant.name}
            className={cx("w-full", ui.fieldOnPaper)}
          />
        </div>
        <div>
          <label className={ui.fieldLabel}>
            {tr("shortDescription")}
          </label>
          <textarea
            name="shortDescription"
            defaultValue={restaurant.shortDescription ?? ""}
            rows={3}
            className={cx("w-full", ui.fieldOnPaper)}
          />
        </div>
        <div>
          <label className={ui.fieldLabel}>{ta("status")}</label>
          <select
            name="status"
            defaultValue={restaurant.status}
            className={ui.fieldOnPaper}
          >
            <option value="DRAFT">{tStatus("DRAFT")}</option>
            <option value="PUBLISHED">{tStatus("PUBLISHED")}</option>
            <option value="ARCHIVED">{tStatus("ARCHIVED")}</option>
          </select>
        </div>
        <SubmitButton className="px-6 py-2.5">{ta("saveChanges")}</SubmitButton>
      </form>
    </div>
  );
}
