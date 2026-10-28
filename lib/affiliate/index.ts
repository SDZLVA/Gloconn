export { loadAffiliateConfig, DISABLED_AFFILIATE_CONFIG } from "@/lib/affiliate/config";
export { tagOutboundUrl, PARTNER_RULES, type PartnerRule } from "@/lib/affiliate/tagUrl";
export {
  buildKiwiAffiliateUrl,
  buildKiwiSearchUrl,
  type KiwiSearch,
} from "@/lib/affiliate/kiwi";
export type {
  AffiliateConfig,
  AffiliateProgram,
  TagResult,
  TagSkipReason,
} from "@/lib/affiliate/types";
