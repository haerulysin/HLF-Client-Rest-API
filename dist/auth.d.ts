import { HeaderAPIKeyStrategy } from "passport-headerapikey";
export declare const fabricAPIKeyStrategy: HeaderAPIKeyStrategy;
export declare const authAPIKey: (req: Request, res: Response, next: NextFunction) => void;
