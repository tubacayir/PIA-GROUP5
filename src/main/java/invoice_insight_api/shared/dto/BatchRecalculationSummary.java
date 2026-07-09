package invoice_insight_api.shared.dto;

public record BatchRecalculationSummary(
        int customersProcessed,
        int organizationsProcessed,
        int upgraded,
        int downgraded,
        int noChange,
        int highPriority
) {
}
