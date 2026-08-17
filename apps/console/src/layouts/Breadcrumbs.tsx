import { Link, useLocation } from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@gridcore/ui/components/ui/breadcrumb";

import { trailFor } from "@/routes/breadcrumbs";

/**
 * The way back out of an inner page. Renders nothing on a top-level screen,
 * where the only crumb would be the page you are already on.
 */
export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const trail = trailFor(pathname);

  if (trail.length < 2) return null;

  return (
    <Breadcrumb className="mb-3">
      <BreadcrumbList>
        {trail.map((crumb, index) => {
          const last = index === trail.length - 1;
          return (
            <BreadcrumbItem key={crumb.path}>
              {last ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink asChild>
                    <Link to={crumb.path}>{crumb.label}</Link>
                  </BreadcrumbLink>
                  <BreadcrumbSeparator />
                </>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
