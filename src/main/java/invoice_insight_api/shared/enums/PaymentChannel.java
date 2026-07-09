package invoice_insight_api.shared.enums;

public enum PaymentChannel {
    MOBILE_APP,
    WEB,
    BANK_APP,
    STORE,
    AUTO_PAYMENT;

    // MOBILE_APP, WEB, BANK_APP and AUTO_PAYMENT are self-service digital channels;
    // STORE is the only physical/in-person channel. Used for the dashboard's
    // Digital Channels vs Physical Channel payment reporting.
    public boolean isDigital() {
        return this != STORE;
    }
}
