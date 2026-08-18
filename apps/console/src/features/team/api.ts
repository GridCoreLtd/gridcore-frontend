import axiosInstance from "@/utils/axios-instance";

/** The v2 team surface (blueprint 49) — memberships become manageable. */
export interface TeamMember {
  membershipId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  roleName: string;
  roleDisplayName: string;
  /** ACTIVE | LOCKED | DISABLED — the person's login (D-018), not the membership. */
  accountStatus?: string | null;
  grantedAt: string;
  grantedBy?: string | null;
}

export interface AssignableRole {
  id: string;
  name: string;
  displayName: string;
}

/** Each side sees its OWN team: a merchant its members, platform its operators. */
export const listTeam = async () =>
  (await axiosInstance.get<{ data: TeamMember[] }>("/v1/team")).data;

export const listAssignableRoles = async () =>
  (await axiosInstance.get<{ data: AssignableRole[] }>("/v1/roles")).data;

/**
 * One transaction server-side — person, claimable account, the mandatory SMS
 * factor, membership — then a one-time set-password link by SMS. Never a
 * password: legacy's plaintext-password SMS is dead (D-021).
 */
export const inviteTeamMember = async (body: {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  roleId: string;
}) =>
  (await axiosInstance.post<{ membershipId: string }>("/v1/team", body)).data;

export const changeTeamMemberRole = async (membershipId: string, roleId: string) =>
  axiosInstance.patch<void>(`/v1/team/${membershipId}`, { roleId });

/** The row is deleted; the audit row is the history; sessions die with it. */
export const revokeTeamMember = async (membershipId: string) =>
  axiosInstance.delete<void>(`/v1/team/${membershipId}`);
