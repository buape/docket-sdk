// Dependency-free typed client runtime for @buape/docket (see client.d.ts).
const unwrap = (body) =>
	body && typeof body === "object" && "data" in body ? body.data : body

const substitute = (path, params) => {
	const pathParams = params?.path
	return pathParams
		? path.replace(/\{(\w+)\}/g, (_, key) =>
				encodeURIComponent(String(pathParams[key] ?? `{${key}}`))
			)
		: path
}

export function createDocketClient(options = {}) {
	const baseUrl = (options.baseUrl ?? "").replace(/\/+$/, "")
	return {
		async GET(path, params) {
			const query = params?.query
				? new URLSearchParams(
						Object.entries(params.query).filter(
							([, value]) => value !== undefined
						)
					)
				: undefined
			const response = await (options.fetch ?? fetch)(
				`${baseUrl}${substitute(path, params)}${query ? `?${query}` : ""}`,
				{
					method: "GET",
					headers: { ...options.headers, ...params?.header }
				}
			)
			const contentType = response.headers.get("content-type") ?? ""
			const json = contentType.includes("application/json")
				? await response.json().catch(() => undefined)
				: undefined
			return {
				data: response.ok
					? json !== undefined
						? unwrap(json)
						: response
					: undefined,
				error: response.ok ? undefined : (json?.error ?? json),
				response
			}
		}
	}
}
