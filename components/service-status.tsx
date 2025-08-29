"use client"

import { Card, CardContent } from '@/components/ui/card';
import { services } from '@/components/services-config';

const ServiceStatus = ({ status }: { status: Record<string, string> }) => {
    return (
        <div className="flex gap-6 items-start mb-8">
            <div className="flex gap-4 flex-wrap">
                {services.map(({ name }) => (
                    <Card key={name} className="w-60 text-center">
                        <CardContent className="py-6">
                            <h2 className="text-xl font-semibold">{name}</h2>
                            <p className={`mt-2 ${status[name] === 'Activo' ? 'text-green-600' : status[name] === 'Error' ? 'text-red-600' : 'text-yellow-600'}`}>
                                {status[name]}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ServiceStatus;
