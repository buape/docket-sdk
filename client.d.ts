/**
 * Typed, dependency-free client for one Docket instance, bound to the
 * generated `paths` from the OpenAPI spec.
 */
import type { paths } from "./index.js"

type Jsonify<Response> = Response extends {
	content: { "application/json": infer Body }
}
	? Body
	: never

type Operation<Path extends GetPath> = Path extends keyof paths
	? paths[Path] extends { get: infer Op }
		? Op
		: never
	: never

/** Every path the read-only API serves with GET. */
export type GetPath = {
	[Path in keyof paths]: paths[Path] extends { get: unknown } ? Path : never
}[keyof paths]

type Responses<Op> = NonNullable<Op extends { responses: infer R } ? R : never>

// Response codes are emitted as numeric or string keys depending on the
// generator version; match either.
type JsonAt<Body, Status extends string | number> =
	| (Body extends { [K in Status]: infer Response }
			? Jsonify<Response>
			: never)
	| (Body extends { [K in `${Status}`]: infer Response }
			? Jsonify<Response>
			: never)

type Unwrap<T> = [T] extends [never]
	? never
	: T extends { data: infer Body }
		? Body
		: T extends { error: infer Body }
			? Body
			: T

type PathParams<Op> = Op extends { parameters: { path: infer Params } }
	? Params extends { [key: string]: unknown }
		? Params
		: never
	: never

type SuccessBody<Op> = Unwrap<JsonAt<Responses<Op>, 200>>

type ErrorBody<Op> = Unwrap<
	{
		[
			Status in Exclude<keyof Responses<Op>, 200 | "200" | "default">
		]: JsonAt<Responses<Op>, Status & (string | number)>
	}[Exclude<keyof Responses<Op>, 200 | "200" | "default">]
>

export type DocketResult<Path extends GetPath> = {
	/** The unwrapped `data` envelope on a 2xx response; a raw `Response` when the endpoint serves binary media. */
	data?: [SuccessBody<Operation<Path>>] extends [never]
		? Response
		: SuccessBody<Operation<Path>>
	/** The unwrapped `error` envelope on a non-2xx response. */
	error?: ErrorBody<Operation<Path>>
	/** The raw `Response`, whatever the status. */
	response: Response
}

export interface DocketClientOptions {
	/** Instance to read from, e.g. `https://docket.buape.com`. */
	baseUrl?: string
	fetch?: typeof fetch
	headers?: Record<string, string>
}

export interface DocketRequestOptions {
	path?: { [key: string]: string | number }
	query?: { [key: string]: string | number | boolean | undefined }
	header?: Record<string, string>
}

/** Category tokens ride on `Authorization: Bearer dkat_...` headers. */
export type DocketClient = {
	GET<Path extends GetPath>(
		path: Path,
		...request: [PathParams<Operation<Path>>] extends [never]
			? [options?: DocketRequestOptions]
			: [
					options: Omit<DocketRequestOptions, "path"> & {
						path: PathParams<Operation<Path>>
					}
				]
	): Promise<DocketResult<Path>>
}

export declare function createDocketClient(
	options?: DocketClientOptions
): DocketClient
