import {
  Component, Input, OnChanges, ChangeDetectionStrategy
} from '@angular/core';
import {
  LucideAngularModule, LucideIconData,
  ArrowLeft, ArrowRight, Sparkles, BadgeCheck, ChartBar, Zap, Wrench,
  CalendarDays, Phone, Megaphone, CircleX, Car, LayoutGrid, Check,
  CircleCheck, ChevronRight, X, CloudOff, Images, CreditCard,
  LayoutDashboard, Trash2, FileText, ChartPie, Pencil, HardHat,
  CircleAlert, Filter, Quote, MessageSquare, Warehouse, Users,
  Handshake, CircleQuestionMark, History, House, Hourglass, Inbox,
  Info, TrendingUp, KeyRound, Sun, Moon, Tag, MapPin, Lock,
  LockKeyhole, LogIn, LogOut, Mail, MailOpen, Menu, PanelLeftClose,
  Mic, LocateFixed, Navigation, Bell, BellRing, BellOff, CirclePause,
  Banknote, User, UserPlus, UserSearch, Camera, FileDown, Play,
  CirclePlay, TriangleAlert, LoaderCircle, Brain, Receipt, RefreshCw,
  Star, Save, PiggyBank, Clock, Search, SearchX, SendHorizontal,
  Settings, Bot, CircleStop, Store, Headphones, Table2, ClipboardCheck,
  GitCommitVertical, Timer, CircleDot, TrendingDown, Trophy, Landmark,
  Wallet, ShieldCheck, MessageCircle, BatteryLow, ClipboardList, Truck,
  HeartHandshake, Eye, EyeOff, HardDriveDownload
} from 'lucide-angular';

/** Mapa de nombres Material Symbols → datos de icono Lucide.
 *  Úsalo así: <app-icon name="dashboard" [size]="20" class="text-brand-500" />
 *  Los nombres son los originales de Material Symbols para no cambiar la lógica. */
const ICON_MAP: Record<string, LucideIconData> = {
  // --- Navegación ---
  dashboard:            LayoutDashboard,
  home:                 House,
  menu:                 Menu,
  menu_open:            PanelLeftClose,
  arrow_back:           ArrowLeft,
  arrow_forward:        ArrowRight,
  chevron_right:        ChevronRight,
  close:                X,
  logout:               LogOut,
  login:                LogIn,
  settings:             Settings,

  // --- Incidentes / Estado ---
  warning:              TriangleAlert,
  priority_high:        TriangleAlert,
  error:                CircleAlert,
  cancel:               CircleX,
  check:                Check,
  check_circle:         CircleCheck,
  task_alt:             ClipboardCheck,
  assignment:           ClipboardList,
  schedule:             Clock,
  hourglass_top:        Hourglass,
  timer:                Timer,
  progress_activity:    LoaderCircle,
  refresh:              RefreshCw,
  play_arrow:           Play,
  play_circle:          CirclePlay,
  stop_circle:          CircleStop,
  pause_circle:         CirclePause,

  // --- Vehículos / Emergencias ---
  directions_car:       Car,
  car_crash:            Car,
  tire_repair:          CircleDot,
  bolt:                 Zap,
  build:                Wrench,
  engineering:          HardHat,
  garage:               Warehouse,

  // --- Ubicación ---
  location_on:          MapPin,
  my_location:          LocateFixed,
  near_me:              Navigation,

  // --- Personas / Roles ---
  person:               User,
  person_add:           UserPlus,
  person_search:        UserSearch,
  groups:               Users,
  badge:                BadgeCheck,
  engineering_roles:    HardHat,

  // --- Comunicación ---
  notifications:        Bell,
  notifications_active: BellRing,
  notifications_off:    BellOff,
  call:                 Phone,
  phone:                Phone,
  forum:                MessageSquare,
  chat:                 MessageCircle,
  send:                 SendHorizontal,
  mail:                 Mail,
  mark_email_unread:    MailOpen,
  campaign:             Megaphone,
  support_agent:        Headphones,

  // --- Finanzas ---
  payments:             Banknote,
  savings:              PiggyBank,
  receipt_long:         Receipt,
  account_balance:      Landmark,
  account_balance_wallet: Wallet,
  credit_card:          CreditCard,

  // --- Datos / Reportes ---
  analytics:            ChartBar,
  bar_chart:            ChartBar,
  show_chart:           TrendingUp,
  insights:             TrendingUp,
  trending_up:          TrendingUp,
  trending_down:        TrendingDown,
  pie_chart:            ChartPie,
  donut_large:          ChartPie,
  donut_small:          ChartPie,
  table_view:           Table2,
  timeline:             GitCommitVertical,
  auto_awesome:         Sparkles,
  smart_toy:            Bot,
  psychology:           Brain,

  // --- Administración ---
  admin_panel_settings: ShieldCheck,
  verified:             BadgeCheck,
  workspace_premium:    Trophy,
  store:                Store,
  storefront:           Store,
  reviews:              Star,
  star:                 Star,
  category:             LayoutGrid,

  // --- Archivos / Acciones ---
  description:          FileText,
  collections:          Images,
  photo_camera:         Camera,
  picture_as_pdf:       FileDown,
  delete:               Trash2,
  edit:                 Pencil,
  save:                 Save,
  search:               Search,
  search_off:           SearchX,
  filter_alt:           Filter,
  calendar_today:       CalendarDays,
  inbox:                Inbox,

  // --- Seguridad ---
  lock:                 Lock,
  lock_reset:           LockKeyhole,
  visibility:           Eye,
  visibility_off:       EyeOff,

  // --- Misc ---
  history:              History,
  info:                 Info,
  format_quote:         Quote,
  handshake:            Handshake,
  help:                 CircleQuestionMark,
  battery_alert:        BatteryLow,
  local_offer:          Tag,
  local_shipping:       Truck,
  cloud_off:            CloudOff,
  mic:                  Mic,
  mic_off:              Mic,
  key:                  KeyRound,
  other:                CircleQuestionMark,
  uncertain:            CircleQuestionMark,
  dark_mode:            Moon,
  light_mode:           Sun,
};

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lucide-angular
      [img]="resolved"
      [size]="size"
      [strokeWidth]="strokeWidth"
      color="currentColor"
      [class.animate-spin]="autoSpin"
      style="display:block">
    </lucide-angular>`,
  styles: [':host { display:inline-flex; align-items:center; justify-content:center; }'],
})
export class AppIconComponent implements OnChanges {
  @Input() name = '';
  @Input() size = 20;
  @Input() strokeWidth = 2;

  resolved: LucideIconData = CircleQuestionMark;
  autoSpin = false;

  ngOnChanges(): void {
    this.resolved = ICON_MAP[this.name] ?? CircleQuestionMark;
    this.autoSpin = this.name === 'progress_activity';
  }
}
