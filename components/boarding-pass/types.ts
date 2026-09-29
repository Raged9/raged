export interface BoardingPassData {
  passenger: string;
  fromCity: string;
  fromCode: string;
  toCity: string;
  toCode: string;
  flight: string;
  gate: string;
  seat: string;
  boardingTime: string;
  date: string;
  classType: string;
}

export interface BoardingPassProps {
  progress: number; // 0 to 1 (tear progress)
  detach: number; // 0 to 1 (stub detachment)
  onTear?: (progress: number) => void;
  onRelease?: () => void;
  onKeyboardTear?: (delta: number) => void;
  onReattach?: () => void;
  ticketData?: Partial<BoardingPassData>;
  className?: string;
}
