import {
  Plus, Hand, Search, CheckCircle, Calendar, CalendarCheck,
  XCircle, Clock, Moon, Trophy, ThumbsDown, Handshake, type LucideIcon
} from "lucide-react";
import type { LeadState } from "@/types";

interface StateConfig {
  label: string;
  color: "blue" | "indigo" | "orange" | "green" | "red" | "gray";
  icon: LucideIcon;
}

export const STATE_CONFIG: Record<LeadState, StateConfig> = {
  new:                { label: "Novo",           color: "blue",   icon: Plus },
  welcomed:           { label: "Boas-vindas",    color: "indigo", icon: Hand },
  qualifying:         { label: "Qualificando",   color: "orange", icon: Search },
  qualified:          { label: "Qualificado",    color: "green",  icon: CheckCircle },
  scheduling:         { label: "Agendando",      color: "blue",   icon: Calendar },
  scheduled:          { label: "Agendado",       color: "green",  icon: CalendarCheck },
  disqualified:       { label: "Desqualificado", color: "red",    icon: XCircle },
  followup_d1:        { label: "Follow-up D1",   color: "orange", icon: Clock },
  followup_d2:        { label: "Follow-up D2",   color: "orange", icon: Clock },
  followup_d3:        { label: "Follow-up D3",   color: "orange", icon: Clock },
  followup_d4:        { label: "Follow-up D4",   color: "orange", icon: Clock },
  followup_d5:        { label: "Follow-up D5",   color: "orange", icon: Clock },
  followup_d6:        { label: "Follow-up D6",   color: "orange", icon: Clock },
  followup_d7:        { label: "Follow-up D7",   color: "orange", icon: Clock },
  no_response:        { label: "Sem Resposta",   color: "gray",   icon: Moon },
  converted:          { label: "Convertido",     color: "green",  icon: Trophy },
  lost:               { label: "Perdido",        color: "red",    icon: ThumbsDown },
  handoff_requested:  { label: "Handoff",        color: "blue",   icon: Handshake },
};

export const STATE_COLOR_MAP: Record<string, string> = {
  blue: "bg-info/15 text-info border-info/30",
  indigo: "bg-primary/15 text-primary border-primary/30",
  orange: "bg-warning/15 text-warning border-warning/30",
  green: "bg-success/15 text-success border-success/30",
  red: "bg-destructive/15 text-destructive border-destructive/30",
  gray: "bg-muted text-muted-foreground border-border",
};

export function getStateStyle(state: LeadState) {
  const config = STATE_CONFIG[state];
  if (!config) return { label: state, classes: STATE_COLOR_MAP.gray, Icon: Plus };
  return {
    label: config.label,
    classes: STATE_COLOR_MAP[config.color],
    Icon: config.icon,
  };
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 13) {
    return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`;
  }
  return phone;
}

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}
