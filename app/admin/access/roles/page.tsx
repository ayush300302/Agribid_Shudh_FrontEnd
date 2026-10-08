"use client";

import AdminShell from "@/components/layout/AdminShell";
import { useLocale } from "@/components/providers/LocaleProvider";

const roles = [
  { code: "MF_OWNER", application: "MOBILE", tier: "MF" },
  { code: "SS_OWNER", application: "MOBILE", tier: "SS" },
  { code: "DS_OWNER", application: "MOBILE", tier: "DS" },
  { code: "SD_OWNER", application: "MOBILE", tier: "SD" },
  { code: "RT_OWNER", application: "MOBILE", tier: "RT" },
  { code: "ADM_SUPER", application: "ADMIN", tier: "-" },
  { code: "ADM_SALES_OPS", application: "ADMIN", tier: "-" },
  { code: "ADM_FINANCE", application: "ADMIN", tier: "-" },
  { code: "ADM_CATALOG", application: "ADMIN", tier: "-" },
  { code: "ADM_SUPPORT", application: "ADMIN", tier: "-" },
  { code: "ADM_STATE_MGR", application: "ADMIN", tier: "STATE" },
  { code: "DS_STAFF_BILLING", application: "MOBILE", tier: "DS · P2" },
] as const;

const permissions = [
  "role.view",
  "role.manage",
  "adminuser.manage",
  "order.place",
  "order.accept",
  "order.on_behalf",
  "inventory.adjust",
  "payment.record",
  "partner.create_child",
  "price.publish",
  "credit.set_child",
] as const;

const dataScopes = [
  { code: "OWN", description: "scopeOwn" },
  { code: "AS_BUYER", description: "scopeAsBuyer" },
  { code: "AS_SELLER", description: "scopeAsSeller" },
  { code: "CHILDREN", description: "scopeChildren" },
  { code: "DOWNLINE", description: "scopeDownline" },
  { code: "STATE", description: "scopeState" },
  { code: "ALL", description: "scopeAll" },
] as const;

export default function RolesPage() {
  const { t } = useLocale();

  return (
    <AdminShell>
      <div className="space-y-8">
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1b5e20]">
            {t("accessControl")}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#19392a]">
            {t("rolesAndPermissions")}
          </h1>
          <p role="note" className="mt-4 border-l-2 border-[#ed8b32] pl-4 text-sm leading-6 text-[#64766a]">
            {t("specificationReference")} {t("roleMappingNote")}
          </p>
        </header>

        <section aria-labelledby="role-codes-heading">
          <h2 id="role-codes-heading" className="mb-3 text-lg font-semibold text-[#19392a]">
            {t("roleCodes")}
          </h2>
          <div className="overflow-x-auto border-y border-[#dce5dd] bg-white">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="bg-[#f1f5f1] text-xs uppercase tracking-wide text-[#64766a]">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">{t("roleCode")}</th>
                  <th scope="col" className="px-4 py-3 font-semibold">{t("application")}</th>
                  <th scope="col" className="px-4 py-3 font-semibold">{t("partnerTier")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8eee9]">
                {roles.map((role) => (
                  <tr key={role.code}>
                    <th scope="row" className="px-4 py-3 font-mono text-xs font-medium text-[#19392a]">
                      {role.code}
                    </th>
                    <td className="px-4 py-3 text-[#31483a]">{role.application}</td>
                    <td className="px-4 py-3 text-[#64766a]">{role.tier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="permission-codes-heading">
          <h2 id="permission-codes-heading" className="mb-3 text-lg font-semibold text-[#19392a]">
            {t("permissionCodes")}
          </h2>
          <ul className="flex flex-wrap gap-2" aria-label={t("permissionCodes")}>
            {permissions.map((permission) => (
              <li key={permission}>
                <code className="inline-flex rounded-sm border border-[#dce5dd] bg-white px-2.5 py-1.5 text-xs text-[#31483a]">
                  {permission}
                </code>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="data-scopes-heading">
          <h2 id="data-scopes-heading" className="mb-3 text-lg font-semibold text-[#19392a]">
            {t("dataScopes")}
          </h2>
          <div className="overflow-x-auto border-y border-[#dce5dd] bg-white">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="bg-[#f1f5f1] text-xs uppercase tracking-wide text-[#64766a]">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">{t("scope")}</th>
                  <th scope="col" className="px-4 py-3 font-semibold">{t("meaning")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8eee9]">
                {dataScopes.map((scope) => (
                  <tr key={scope.code}>
                    <th scope="row" className="px-4 py-3 font-mono text-xs font-medium text-[#19392a]">
                      {scope.code}
                    </th>
                    <td className="px-4 py-3 text-[#64766a]">{t(scope.description)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}