<?php

namespace MASK\Mask\Utility;

use Symfony\Component\PropertyAccess\PropertyAccess;

class TcaConverterUtility
{
    public static function convertTcaArrayToFlat(array $config, $path = ['config']): array
    {
        $tca = [];
        foreach ($config as $key => $value) {
            $path[] = $key;
            if ($key === 'items') {
                $items = $value;
                $itemText = '';
                foreach ($items as $item) {
                    $itemText .= implode(',', $item) . "\n";
                }
                $fullPath = implode('.', $path);
                $tca[$fullPath] = trim($itemText);
            } elseif (is_array($value)) {
                $tca = array_merge($tca, self::convertTcaArrayToFlat($value, $path));
            } else {
                if ($key === 'eval') {
                    if ($value !== '') {
                        $keys = explode(',', $value);

                        // Special handling for timestamp field, as the dateType is in the key "config.eval"
                        $dateTypesInKeys = array_intersect($keys, ['date', 'datetime', 'time', 'timesec']);
                        if (count($dateTypesInKeys) > 0) {
                            $fullPath = implode('.', $path);
                            $tca[$fullPath] = $dateTypesInKeys[0];
                            // Remove dateType from normal eval array
                            $keys = array_filter($keys, function ($a) use ($dateTypesInKeys) {
                                return $a !== $dateTypesInKeys[0];
                            });
                        }

                        $evalArray = array_combine($keys, array_fill(0, count($keys), 1));
                        $tca = array_merge($tca, self::convertTcaArrayToFlat($evalArray, $path));
                    }
                } else {
                    $fullPath = implode('.', $path);
                    $tca[$fullPath] = $value;
                }
            }
            array_pop($path);
        }
        return $tca;
    }

    /**
     * @param $tca
     * @return array
     */
    public static function convertFlatTcaToArray($tca): array
    {
        $tcaArray = [];
        $accessor = PropertyAccess::createPropertyAccessor();
        foreach ($tca as $key => $value) {
            if ($key === 'config.items') {
                $items = [];
                foreach (explode("\n", $value) as $line) {
                    $items[] = explode(',', $line);
                }
                $value = $items;
            }
            // This is for timestamps as it has a fake tca property for eval date, datetime, ...
            if ($key === 'config.eval' && in_array($value, ['date', 'datetime', 'time', 'timesec'])) {
                $key = 'config.eval.' . $value;
                $value = 1;
            }
            $explodedKey = explode('.', $key);
            $propertyPath = array_reduce($explodedKey, function ($carry, $property) {
                return $carry . "[$property]";
            });
            $accessor->setValue($tcaArray, $propertyPath, $value);
        }
        return self::mergeEvalValues($tcaArray);
    }

    protected static function mergeEvalValues($tcaArray): array
    {
        if (!isset($tcaArray['config']['eval'])) {
            return $tcaArray;
        }
        $mergedTca = [];
        foreach($tcaArray['config']['eval'] as $key => $evalValue) {
            if ($evalValue) {
                $mergedTca[] = $key;
            }
        }
        $tcaArray['config']['eval'] = implode(',', $mergedTca);
        return $tcaArray;
    }
}
