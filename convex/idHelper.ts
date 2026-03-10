/**
 * Generates a unique CSL request ID in the format:
 * CSL-DD.MM.YY-NN  (where NN is today's daily sequence, zero-padded)
 * 
 * @param ctx   Convex query/mutation context
 * @param table The table to count existing today's records in
 * @param dateField The field to filter by date (defaults to 'createdAt' in ms)
 */
export async function generateCslId(
    ctx: any,
    table: string,
    prefix: string = "CSL"
): Promise<string> {
    const now = new Date();

    // Use IST offset (UTC+5:30) consistently
    const istOffset = 5.5 * 60 * 60 * 1000;
    const ist = new Date(now.getTime() + istOffset);

    const dd = String(ist.getUTCDate()).padStart(2, "0");
    const mm = String(ist.getUTCMonth() + 1).padStart(2, "0");
    const yy = String(ist.getUTCFullYear()).slice(-2);
    const dateStr = `${dd}${mm}${yy}`;

    // Get start and end of today in UTC (to count today's records)
    const startOfDay = new Date(ist.toISOString().slice(0, 10) + "T00:00:00Z").getTime() - istOffset;
    const endOfDay = startOfDay + 86400000;

    const allRecords = await ctx.db.query(table).collect();
    const todayCount = allRecords.filter((r: any) => {
        const t = r.createdAt || r.startTime || r._creationTime;
        return t >= startOfDay && t < endOfDay;
    }).length;

    const seq = String(todayCount + 1).padStart(2, "0");
    return `${prefix}-${dateStr}-${seq}`;
}
