package common

type HeadersCarrier map[string]string

func (a HeadersCarrier) Get(key string) string {
	value, ok := a[key]
	if !ok {
		return ""
	}

	return value
}

func (a HeadersCarrier) Set(key, value string) {
	a[key] = value
}

func (a HeadersCarrier) Keys() []string {
	keys := make([]string, len(a))
	index := 0

	for key := range a {
		keys[index] = key
		index++
	}

	return keys
}