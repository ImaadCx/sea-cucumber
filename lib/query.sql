SELECT
    c.endpoint,
    c.last_commit_date,
    COALESCE(s.error_count_last_30d, 0) AS sentry_errors,
    COALESCE(l.request_volume_last_6m, 0) AS request_volume,
    COALESCE(j.issue_key, 'No Jira tasks') AS jira_ticket,
    j.status AS jira_status,
    CASE
        WHEN (c.last_commit_date < '2024-11-26')
             AND (l.request_volume_last_6m < 100 OR l.request_volume_last_6m IS NULL)
             AND (s.error_count_last_30d < 5 OR s.error_count_last_30d IS NULL)
             AND (j.issue_key IS NULL OR j.status = 'Backlog')
        THEN '🦴 BARNACLE - Safe to Remove'
        WHEN (c.last_commit_date < '2024-11-26' AND l.request_volume_last_6m < 500)
        THEN '⚠️  LOW ACTIVITY - Consider Deprecation'
        ELSE '✅ ACTIVE'
    END AS recommendation
FROM code_csv.code_activity c
LEFT JOIN sentry_csv.sentry_errors s ON c.endpoint = s.endpoint
LEFT JOIN deployment_csv.deployment_logs l ON c.endpoint = l.endpoint
LEFT JOIN jira_csv.jira_backlog j ON c.endpoint = j.endpoint
ORDER BY request_volume ASC, last_commit_date ASC;
